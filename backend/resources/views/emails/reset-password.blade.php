<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation du mot de passe</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Bonjour,</p>
    <p>Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien ci-dessous pour en choisir un nouveau :</p>
    <p><a href="{{ $resetUrl }}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px;">Réinitialiser mon mot de passe</a></p>
    <p>Ce lien expire dans {{ $expireMinutes }} minutes.</p>
    <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    <p style="color: #64748b; font-size: 14px;">— {{ config('app.name') }}</p>
</body>
</html>
