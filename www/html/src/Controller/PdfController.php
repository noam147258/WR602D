<?php

namespace App\Controller;

use App\Service\PdfClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PdfController extends AbstractController
{
    public function __construct(
        private readonly PdfClient $pdfClient,
    ) {
    }

    #[Route('/pdf/generate', name: 'app_pdf_generate', methods: ['GET', 'POST'])]
    public function generate(Request $request): Response
    {
        $html = $request->request->get('html') ?? $request->query->get('html') ?? $this->getDefaultHtml();

        $pdfContent = $this->pdfClient->htmlToPdf($html);

        return new Response($pdfContent, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="document.pdf"',
        ]);
    }

    private function getDefaultHtml(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Document PDF</title>
</head>
<body>
    <h1>Document généré par Gotenberg</h1>
    <p>Ce PDF a été créé via le micro-service Gotenberg et Symfony HttpClient.</p>
</body>
</html>
HTML;
    }
}
