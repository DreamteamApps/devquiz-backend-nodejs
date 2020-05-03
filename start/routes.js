'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/**
 * Admin Routes
 * 
*/
Route.post('admin/auth/token', 'UserController.loginAdmin');

Route.group(() => {
    Route.get('questions/list', 'QuestionController.getListById');
    Route.resource('questions', 'QuestionController').apiOnly();
    
    Route.get('themes/list', 'ThemeController.getListById');
    Route.resource('themes', 'ThemeController').apiOnly();

}).prefix('admin').middleware('auth');

/**
 * Game routes
 * 
*/
Route.group(() => {
    Route.post('create', 'MatchController.store');
    Route.post('join', 'MatchController.joinMatchWithCode');
}).prefix('match');

Route.group(() => {
    Route.post('create', 'UserController.getOrCreateUser');
}).prefix('user');

