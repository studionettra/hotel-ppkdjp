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
        Schema::table('guests', function (Blueprint $table) {
            $table->string('profession')->nullable()->after('full_name');
            $table->string('company')->nullable()->after('profession');
            $table->string('member_card_no')->nullable()->after('gender');
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->time('arrival_time')->nullable()->after('check_in_date');
            $table->string('payment_method')->nullable()->after('total_amount');
            $table->string('deposit_box_number')->nullable()->after('payment_method');
            $table->string('deposit_box_issued_by')->nullable()->after('deposit_box_number');
            $table->date('deposit_box_date')->nullable()->after('deposit_box_issued_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guests_and_reservations', function (Blueprint $table) {
            //
        });
    }
};
