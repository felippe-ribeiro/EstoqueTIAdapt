var express = require('express')
var users = require('./../inc/users')
var router = express.Router()
var admin = require('./../inc/admin')
var itens = require('./../inc/itens')
var contacts = require('./../inc/contacts')
var emails = require('./../inc/emails')
var reservations = require('./../inc/reservations')
var moment = require('moment')
const connection = require('../inc/db')

module.exports = function(io){

    
moment.locale('pt-BR')

router.use(function (req, res, next) {
    if (['/login'].indexOf(req.url) == -1 && !req.session.user) {
        res.redirect('/admin/login')
    } else {
        next()
    }

})

router.use(function (req, res, next) {

    req.menus = admin.getMenus(req)
    next()
})

router.get('/logout', function (req, res, next) {
    delete req.session.user
    res.redirect('/admin/login')
})

router.get('/', function (req, res, next) {
    admin.dashboard().then(data => {
        res.render('admin/index', admin.getParams(req, {
            data
        }))
    }).catch(err => {
        console.log(err)
    })
})

router.get('/dashboard', function(req, res, next){

    reservations.dashboard().then(data=>{

        res.send(data)
    })
})

router.post('/login', function (req, res, next) {
    if (!req.body.email) {
        users.render(req, res, 'Preencha o campo e-mail')
    } else if (!req.body.password) {
        users.render(req, res, 'Preencha o campo Senha')
    } else {
        users.login(req.body.email, req.body.password).then(user => {
            req.session.user = user
            res.redirect('/admin')
        }).catch(err => {
            users.render(req, res, err.message || err)
        })
    }
})

router.get('/login', function (req, res, next) {
    users.render(req, res, null)
})

router.get('/contacts', function (req, res, next) {

    contacts.getContacts().then(data=>{

        res.render('admin/contacts', admin.getParams(req, {
            data
        }))
    })
    
})

router.delete('/contacts/:id', function(req, res, next){

    contacts.delete(req.params.id).then(results=>{
        res.send(results)
        io.emit('dashboard update')
    }).catch(err=>{
        res.send(err)
    })
})

router.get('/emails', function (req, res, next) {

    emails.getEmails().then(data=>{
       res.render('admin/emails', admin.getParams(req, {
           data
       }))

    })
})

router.delete('/emails/:id', function(req, res, next){

    emails.delete(req.params.id).then(results=>{
        res.send(results)
        io.emit('dashboard update')
    }).catch(err=>{
        res.send(err)
    })
})

router.get('/itens', function (req, res, next) {

    itens.getItens(req.query.search).then(data => {

        res.render('admin/itens', admin.getParams(req, {
            data
        }))

    })


})

router.post('/itens', function (req, res, next) {
    itens.save(req.fields, req.files).then(results => {
        io.emit('dashboard update')
        res.send(results)
    }).catch(err => {

        res.send(err)
    })
})

router.delete('/itens/:id', function (req, res, next) {

    itens.delete(req.params.id).then(results => {
        io.emit('dashboard update')
        res.send(results)
    }).catch(err => {
        res.send(err)
    })
})

router.get('/reservations', function (req, res, next) {
    let start = (req.query.start) ? req.query.start : moment().subtract(1, 'year').format('yyyy-mm-dd')
    let end = (req.query.end) ? req.query.end : moment().format('YYYY-MM-DD')
    reservations.getReservations(req).then(pag => {
        res.render('admin/reservations', admin.getParams(req, {
            date: {
                start,
                end
            },
            data: pag.data,
            moment,
            links: pag.links
        }))
    })

})

router.get('/reservations/chart', function(req, res, next){

    req.query.start = (req.query.start) ? req.query.start : moment().subtract(1, 'year').format('YYYY-MM-DD')
    req.query.end = (req.query.end) ? req.query.end : moment().format('YYYY-MM-DD')

    reservations.chart(req).then(chartData=>{

        res.send(chartData)
    })
})

router.post('/reservations', function (req, res, next) {
    reservations.save(req.fields, req.files).then(results => {
        io.emit('dashboard update')
        res.send(results)
    }).catch(err => {

        res.send(err)
    })
})

router.delete('/reservations/:id', function (req, res, next) {

    reservations.delete(req.params.id).then(results => {
        io.emit('dashboard update')
        res.send(results)
    }).catch(err => {
        res.send(err)
    })
})


router.get('/users', function (req, res, next) {
    users.getUsers().then(data=>{
        res.render('admin/users', admin.getParams(req, {
            data
        }))
    })
    
})

router.post('/users', function (req, res, next) {
    users.save(req.fields).then(results=>{
        io.emit('dashboard update')
        res.send(results)

    }).catch(err =>{
        res.send(err)
    })
})

router.post('/users/password-change', function(req, res, next){
    users.changePassword(req).then(results=>{

        res.send(results)

    }).catch(err =>{
        res.send({
            error: err
        })
    })
})

router.delete('/users/:id', function (req, res, next) {
    users.delete(req.params.id).then(results=>{
        io.emit('dashboard update')
        res.send(results)

    }).catch(err =>{
        res.send(err)
    })
})

    return router
}