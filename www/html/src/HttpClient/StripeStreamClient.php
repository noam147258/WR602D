<?php

namespace App\HttpClient;

use Stripe\Exception;
use Stripe\HttpClient\ClientInterface;
use Stripe\Stripe;
use Stripe\Util;

/**
 * Client HTTP pour Stripe basé sur les flux PHP (stream context).
 * Permet d'utiliser l'API Stripe sans l'extension cURL.
 */
class StripeStreamClient implements ClientInterface
{
    private const DEFAULT_TIMEOUT = 80;
    private const DEFAULT_CONNECT_TIMEOUT = 30;

    public function request($method, $absUrl, $headers, $params, $hasFile, $apiMode = 'v1', $maxNetworkRetries = null)
    {
        $method = strtolower($method);
        list($absUrl, $body) = $this->buildUrlAndBody($method, $absUrl, $params, $hasFile, $apiMode);

        $hasIdempotencyKey = false;
        foreach ($headers as $h) {
            if (stripos($h, 'Idempotency-Key:') === 0) {
                $hasIdempotencyKey = true;
                break;
            }
        }
        if (!$hasIdempotencyKey
            && (($apiMode === 'v2' && in_array($method, ['post', 'delete'], true))
                || ($method === 'post' && Stripe::$maxNetworkRetries > 0))) {
            $headers[] = 'Idempotency-Key: ' . $this->uuid();
        }
        $headers[] = 'Expect: ';

        $opts = [
            'http' => [
                'method' => strtoupper($method),
                'header' => implode("\r\n", $headers),
                'timeout' => self::DEFAULT_TIMEOUT,
                'ignore_errors' => true,
            ],
        ];
        if ($body !== null && $body !== '') {
            $opts['http']['content'] = $body;
        }
        if (!Stripe::getVerifySslCerts()) {
            $opts['ssl'] = ['verify_peer' => false, 'verify_peer_name' => false];
        } else {
            $caPath = Stripe::getCABundlePath();
            if (is_string($caPath) && $caPath !== '') {
                $opts['ssl'] = ['cafile' => $caPath];
            }
        }

        $context = stream_context_create($opts);

        $stream = @fopen($absUrl, 'r', false, $context);
        if ($stream === false) {
            $err = error_get_last();
            throw new Exception\ApiConnectionException(
                $err['message'] ?? 'Could not connect to Stripe API'
            );
        }

        $meta = stream_get_meta_data($stream);
        $wrapperData = $meta['wrapper_data'] ?? [];
        $rbody = stream_get_contents($stream);
        fclose($stream);

        $rcode = 200;
        $rheaders = new Util\CaseInsensitiveArray();

        foreach ($wrapperData as $line) {
            if (preg_match('#^HTTP/\d\.\d\s+(\d+)#i', $line, $m)) {
                $rcode = (int) $m[1];
            } elseif (strpos($line, ':') !== false) {
                list($key, $value) = explode(':', trim($line), 2);
                $rheaders[trim($key)] = trim($value);
            }
        }

        return [$rbody, $rcode, $rheaders];
    }

    private function buildUrlAndBody($method, $absUrl, $params, $hasFile, $apiMode)
    {
        $params = Util\Util::objectsToIds($params);
        if ($method === 'post') {
            $absUrl = Util\Util::utf8($absUrl);
            if ($hasFile) {
                return [$absUrl, $params];
            }
            if ($apiMode === 'v2') {
                if (is_array($params) && count($params) === 0) {
                    return [$absUrl, null];
                }
                return [$absUrl, json_encode($params)];
            }
            return [$absUrl, Util\Util::encodeParameters($params)];
        }
        if ($hasFile) {
            throw new Exception\UnexpectedValueException("Unexpected. {$method} methods don't support file attachments");
        }
        if (count($params) === 0) {
            return [Util\Util::utf8($absUrl), null];
        }
        $encoded = Util\Util::encodeParameters($params, $apiMode);
        $absUrl = $absUrl . '?' . $encoded;
        return [Util\Util::utf8($absUrl), null];
    }

    private function uuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
