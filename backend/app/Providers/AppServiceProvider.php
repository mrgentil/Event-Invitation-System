<?php

namespace App\Providers;

use App\Contracts\Repositories\EventRepositoryInterface;
use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Contracts\Repositories\UserRepositoryInterface;
use App\Repositories\EventRepository;
use App\Repositories\GuestRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * All repository bindings.
     *
     * @var array<class-string, class-string>
     */
    public array $bindings = [
        UserRepositoryInterface::class => UserRepository::class,
        EventRepositoryInterface::class => EventRepository::class,
        GuestRepositoryInterface::class => GuestRepository::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        foreach ($this->bindings as $abstract => $concrete) {
            $this->app->bind($abstract, $concrete);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
