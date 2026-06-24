<?php

test('unauthenticated user is redirected to login', function () {
    $response = $this->get('/');

    $response->assertRedirect(route('login'));
});

test('login page returns successful response', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});
