<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation à l'événement</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    @if($event->invitation_body)
        {!! nl2br(e($event->invitation_body)) !!}
    @else
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
    @endif

    @if($guest->rsvp_token)
        @php
            $frontendUrl = rtrim(config('app.frontend_url', config('app.url')), '/');
            $rsvpUrl = $frontendUrl . '/rsvp/' . $guest->rsvp_token;
            $apiUrl = rtrim(config('app.url'), '/');
            $qrImageUrl = $apiUrl . '/api/rsvp/' . $guest->rsvp_token . '/qr';
            $calendarUrl = $apiUrl . '/api/rsvp/' . $guest->rsvp_token . '/calendar';
        @endphp
        <p style="margin-top: 24px;">
            <a href="{{ $rsvpUrl }}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px;">Répondre à l'invitation</a>
        </p>
        <p style="color: #64748b; font-size: 12px;">Ou copiez ce lien : {{ $rsvpUrl }}</p>
        <p style="margin-top: 12px; font-size: 14px;"><a href="{{ $calendarUrl }}" style="color: #2563eb;">📅 Ajouter à mon calendrier (.ics)</a></p>
        <p style="margin-top: 16px;">
            <img src="{{ $qrImageUrl }}" alt="QR code pour répondre à l'invitation" width="160" height="160" style="display: block; border: 1px solid #e2e8f0; border-radius: 8px;" />
            <span style="color: #64748b; font-size: 12px;">Scannez le QR code pour ouvrir la page de réponse</span>
        </p>
    @endif

    <p style="color: #64748b; font-size: 14px; margin-top: 24px;">— {{ config('app.name') }}</p>
</body>
</html>
