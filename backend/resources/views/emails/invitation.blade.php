<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation à l'événement</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Cher(e) {{ $guest->name }},</p>
    <p>Vous êtes invité(e) à l'événement</p>
    <p><strong>{{ $event->title }}</strong></p>
    @if($event->location)
        <p>{{ $event->location }}</p>
    @endif
    <p>{{ $event->date->format('d/m/Y') }} à {{ \Carbon\Carbon::parse($event->time)->format('H:i') }}</p>
    @if($event->description)
        <p>{{ $event->description }}</p>
    @endif
    <p>Nous espérons vous y voir.</p>
    <p style="color: #64748b; font-size: 14px;">— {{ config('app.name') }}</p>
</body>
</html>
