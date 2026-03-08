<?php

namespace App\Services;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Models\Guest;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;

class GuestListImporter
{
    public function __construct(
        private GuestRepositoryInterface $guestRepository
    ) {}

    /**
     * Import guests from Excel/CSV file. Expects first row as header with "name" and "email" columns.
     *
     * @return Guest[]
     */
    public function import(int $eventId, UploadedFile $file): array
    {
        $spreadsheet = IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        if (empty($rows)) {
            return [];
        }

        // Support "Nom" / "name" and "Email" / "email" (spec: colonnes Nom, Email)
        $header = array_map('trim', array_map('strtolower', $rows[0]));
        $nameIndex = $this->findColumnIndex($header, ['nom', 'name']);
        $emailIndex = $this->findColumnIndex($header, ['email']);

        if ($nameIndex === null || $emailIndex === null) {
            return [];
        }

        $guests = [];
        foreach (array_slice($rows, 1) as $row) {
            $name = trim((string) ($row[$nameIndex] ?? ''));
            $email = trim((string) ($row[$emailIndex] ?? ''));
            if ($name === '' || $email === '') {
                continue;
            }
            $guest = $this->guestRepository->createForEvent($eventId, $name, $email);
            $guests[] = $guest;
        }

        return $guests;
    }

    private function findColumnIndex(array $header, array $possibleNames): ?int
    {
        foreach ($possibleNames as $name) {
            $index = array_search($name, $header, true);
            if ($index !== false) {
                return $index;
            }
        }

        return null;
    }
}
