<?php

namespace App\Notifications;

use App\Models\FnbOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FnbOrderRequested extends Notification
{
    use Queueable;

    public $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(FnbOrder $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'fnb_order',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'message' => 'Pesanan F&B baru dari FO: ' . $this->order->order_number,
            'url' => route('fnb.orders.show', $this->order->id),
        ];
    }
}
