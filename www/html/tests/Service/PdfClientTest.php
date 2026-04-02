<?php

namespace App\Tests\Service;

use App\Service\PdfClient;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class PdfClientTest extends TestCase
{
    public function testHtmlToPdfCallsGotenbergAndReturnsPdfContent(): void
    {
        $pdfContent = '%PDF-1.4 fake binary content';
        $response = $this->createMock(ResponseInterface::class);
        $response->method('getStatusCode')->willReturn(200);
        $response->method('getContent')->willReturn($pdfContent);

        $httpClient = $this->createMock(HttpClientInterface::class);
        $httpClient->expects($this->once())
            ->method('request')
            ->with(
                $this->equalTo('POST'),
                $this->stringContains('/forms/chromium/convert/html'),
                $this->callback(function (array $options): bool {
                    return isset($options['headers'], $options['body']);
                })
            )
            ->willReturn($response);

        $client = new PdfClient($httpClient, 'http://gotenberg:3000');
        $result = $client->htmlToPdf('<html><body>Test</body></html>');

        $this->assertSame($pdfContent, $result);
    }
}
