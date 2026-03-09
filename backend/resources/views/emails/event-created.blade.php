<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Événement créé</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Bonjour,</p>
    <p>Votre événement <strong>{{ $event->title }}</strong> a bien été créé.</p>
    <p><strong>{{ $guestsCount }}</strong> invitation(s) ont été envoyée(s) aux invités.</p>
    <p>Date : {{ $event->date->format('d/m/Y') }} à {{ \Carbon\Carbon::parse($event->time)->format('H:i') }}</p>
    @if($event->location)
        <p>Lieu : {{ $event->location }}</p>
    @endif
    <p style="color: #64748b; font-size: 14px;">— {{ config('app.name') }}</p>
</body>
</html>
