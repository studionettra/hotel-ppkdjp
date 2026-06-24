<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('guest_folios', function (Blueprint $table) {
            $table->id();
            $table->string('folio_number', 30)->unique();
            $table->foreignId('guest_id')->constrained('guests');
            $table->foreignId('check_in_id')->constrained('check_ins');
            $table->enum('status', ['open', 'settled', 'void'])->default('open');
            $table->decimal('total_charges', 12, 2)->default(0);
            $table->decimal('total_payments', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_folios');
    }
};
