<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For MySQL, changing enum to string directly sometimes fails without dbal.
        // The safest way is to use a raw query or just string()->change() if dbal is present.
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('status', 20)->default('vc')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert is complex for enum, so we leave it as string
    }
};
