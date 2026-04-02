<?php

namespace App\Service;

use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Client HTTP pour le micro-service de génération PDF (Gotenberg).
 */
class PdfClient
{
    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly string $gotenbergUrl,
    ) {
    }

    /**
     * Convertit du HTML en PDF via Gotenberg.
     *
     * @param string $html Contenu HTML à convertir
     * @return string Contenu binaire du PDF
     * @throws \Exception En cas d'erreur HTTP ou du micro-service
     */
    public function htmlToPdf(string $html): string
    {
        $endpoint = rtrim($this->gotenbergUrl, '/') . '/forms/chromium/convert/html';

        $formData = new FormDataPart([
            'files' => new DataPart($html, 'index.html', 'text/html'),
        ]);
        // Content-Type: multipart/form-data; boundary=... (requis par Gotenberg)
        $headers = $formData->getPreparedHeaders()->toArray();

        try {
            $response = $this->httpClient->request('POST', $endpoint, [
                'headers' => $headers,
                'body' => $formData->bodyToIterable(),
                'timeout' => 30,
            ]);

            $statusCode = $response->getStatusCode();
            if ($statusCode !== 200) {
                throw new \RuntimeException(
                    sprintf('Le micro-service PDF a retourné une erreur (HTTP %d).', $statusCode)
                );
            }

            return $response->getContent();
        } catch (TransportExceptionInterface $e) {
            throw new \RuntimeException(
                'Impossible de joindre le micro-service PDF: ' . $e->getMessage(),
                0,
                $e
            );
        }
    }

    /**
     * Convertit une URL en PDF via Gotenberg (Chromium).
     *
     * @param string $url URL de la page à convertir en PDF
     * @return string Contenu binaire du PDF
     * @throws \Exception En cas d'erreur HTTP ou du micro-service
     */
    public function generatePdfFromUrl(string $url): string
    {
        $endpoint = rtrim($this->gotenbergUrl, '/') . '/forms/chromium/convert/url';

        $formData = new FormDataPart(['url' => $url]);
        $headers = $formData->getPreparedHeaders()->toArray();

        try {
            $response = $this->httpClient->request('POST', $endpoint, [
                'headers' => $headers,
                'body' => $formData->bodyToIterable(),
                'timeout' => 30,
            ]);

            $statusCode = $response->getStatusCode();
            if ($statusCode !== 200) {
                throw new \RuntimeException(
                    sprintf('Le micro-service PDF a retourné une erreur (HTTP %d).', $statusCode)
                );
            }

            return $response->getContent();
        } catch (TransportExceptionInterface $e) {
            throw new \RuntimeException(
                'Impossible de joindre le micro-service PDF: ' . $e->getMessage(),
                0,
                $e
            );
        }
    }
}
