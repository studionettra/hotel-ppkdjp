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
        Schema::create('pool_maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->string('pool_area')->default('main')->comment('main|kids|indoor|jacuzzi');
            $table->string('maintenance_type')->comment('cleaning|chemical_check|equipment_check|repair|inspection');
            $table->string('status')->default('scheduled')->comment('scheduled|in_progress|completed|cancelled');
            $table->decimal('ph_level', 4, 2)->nullable();
            $table->decimal('chlorine_level', 5, 2)->nullable();
            $table->decimal('temperature', 5, 2)->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('findings')->nullable();
            $table->text('action_taken')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pool_maintenance_logs');
    }
};
