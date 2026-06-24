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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('folio_id')->constrained('guest_folios');
            $table->string('payment_number', 30)->unique();
            $table->enum('payment_type', ['deposit', 'payment', 'refund']);
            $table->enum('payment_method', ['cash', 'debit_card', 'credit_card', 'transfer', 'city_ledger']);
            $table->decimal('amount', 12, 2);
            $table->dateTime('payment_date');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
