require('./lib/browser/jquery.js')
utils  = require('utils')
casper = require('casper').create()

screenshot = casper.cli.get 'screenfile'

press_key_in = (selector, key) ->
    press = $.Event('keypress')

    press.ctrlKey = false
    press.which = key

    $(selector).trigger(press)

casper.test.on 'fail', (failure) ->
    casper.capture(screenshot)

casper.start 'http://localhost:5000', ->
    @test.assertTitle 'My Application', 'Title is set correctly'
    @test.assertExists 'textarea[id="nickname"]', 'Nickname box should exist'
    $('#nickname').val('my_name').trigger($.Event('keydown', [{which: 13, keyCode: 13}, ->
        @test.assertExists 'textarea[id="nickname"]']))
    

    @test.assertExists 'textarea[id="message"]', 'Your Message'

    true

casper.run ->
    @test.renderResults true