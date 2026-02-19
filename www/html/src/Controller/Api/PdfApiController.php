<?php

namespace App\Controller\Api;

use App\Service\PdfClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PdfApiController extends AbstractController
{
    public function __construct(
        private readonly PdfClient $pdfClient,
    ) {
    }

    #[Route('/api/pdf/generate-from-url', name: 'api_pdf_generate_from_url', methods: ['POST'])]
    public function generateFromUrl(Request $request): Response
    {
        $payload = json_decode($request->getContent(), true);
        $url = $payload['url'] ?? null;

        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
            return new JsonResponse(['error' => 'URL invalide ou manquante'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $pdfContent = $this->pdfClient->generatePdfFromUrl($url);
        } catch (\Throwable $e) {
            return new JsonResponse(
                ['error' => 'Erreur lors de la génération du PDF: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        return new Response($pdfContent, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="document.pdf"',
        ]);
    }
}
