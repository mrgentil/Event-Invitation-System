<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rappel d'invitation</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Cher(e) {{ $guest->name }},</p>
    <p>Ceci est un rappel : vous êtes invité(e) à l'événement</p>
    <p><strong>{{ $event->title }}</strong></p>
    @if($event->location)
        <p>{{ $event->location }}</p>
    @endif
    <p>{{ $event->date->format('d/m/Y') }} à {{ \Carbon\Carbon::parse($event->time)->format('H:i') }}</p>
    @if($guest->rsvp_token)
        @php $frontendUrl = rtrim(config('app.frontend_url'), '/'); $rsvpUrl = $frontendUrl . '/rsvp/' . $guest->rsvp_token; @endphp
        <p style="margin-top: 24px;">
            <a href="{{ $rsvpUrl }}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px;">Répondre à l'invitation</a>
        </p>
    @endif
    <p style="color: #64748b; font-size: 14px;">— {{ config('app.name') }}</p>
</body>
</html>
