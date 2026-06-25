<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class ModuleServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $modules = $this->getModules();

        foreach ($modules as $module) {
            $providerClass = "App\\Modules\\{$module}\\Providers\\{$module}ServiceProvider";
            if (class_exists($providerClass)) {
                $this->app->register($providerClass);
            }
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $modules = $this->getModules();

        foreach ($modules as $module) {
            $modulePath = app_path("Modules/{$module}");

            // Load API Routes under the global 'api' middleware group
            $apiRoutesPath = "{$modulePath}/Routes/api.php";
            if (file_exists($apiRoutesPath)) {
                Route::middleware('api')
                    ->prefix('api')
                    ->group($apiRoutesPath);
            }

            // Load module database migrations
            $migrationsPath = "{$modulePath}/Database/Migrations";
            if (is_dir($migrationsPath)) {
                $this->loadMigrationsFrom($migrationsPath);
            }
        }
    }

    /**
     * Get all folders within the app/Modules directory.
     *
     * @return array
     */
    private function getModules(): array
    {
        $modulesPath = app_path('Modules');

        if (!is_dir($modulesPath)) {
            return [];
        }

        return array_map('basename', array_filter(glob($modulesPath . '/*'), 'is_dir'));
    }
}
