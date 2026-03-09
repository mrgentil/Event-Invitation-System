<?php

namespace App\Jobs;

use App\Mail\ReminderMail;
use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendEventRemindersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $today = Carbon::today();

        Event::query()
            ->whereNotNull('reminder_days')
            ->where('reminder_days', '>', 0)
            ->with('guests')
            ->get()
            ->filter(function (Event $event) use ($today) {
                $reminderDate = Carbon::parse($event->date)->subDays((int) $event->reminder_days);
                return $reminderDate->isSameDay($today);
            })
            ->each(function (Event $event) {
                foreach ($event->guests as $guest) {
                    Mail::to($guest->email)->send(new ReminderMail($event, $guest));
                }
            });
    }
}
