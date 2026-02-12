<?php

it('redirects root to signup', function () {
    $response = $this->get('/');

    $response->assertRedirect('/signup');
});
