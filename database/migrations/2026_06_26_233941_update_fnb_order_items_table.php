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
        Schema::table('fnb_order_items', function (Blueprint $table) {
            $table->foreignId('menu_item_id')->nullable()->change();
            $table->string('item_name')->nullable()->after('menu_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fnb_order_items', function (Blueprint $table) {
            $table->foreignId('menu_item_id')->nullable(false)->change();
            $table->dropColumn('item_name');
        });
    }
};

