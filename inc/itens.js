let conn = require('./db')
const { save } = require('./reservations')
let path = require('path')
module.exports = {
    getItens(val) {
        return new Promise((resolve, reject) => {
            let query = ''
            console.log(val)
            if(val === undefined){
                query =`
                        SELECT * FROM tb_itens ORDER BY id
                    `
            }else{
                query= `
                        SELECT * FROM tb_itens WHERE description like '%${val}%'
                    `
            }
            conn.query(query, (err, results) => {
                if (err) {
                    reject(err)
                }
                resolve(results)

            })
        })
    },

    save(fields){

        return new Promise((resolve, reject) => {
            
            let query, params = [
                fields.description,
                fields.quantity,
                fields.patrimony,
                fields.tag,
                fields.localization,
                fields.sector,
                fields.hostname,
                fields.serie,
                fields.model
            ]



            if(parseInt(fields.id) > 0){

                params.push(fields.id)
                query = `
                    UPDATE tb_itens
                    SET 
                        description = ?,
                        quantity = ?,
                        patrimony = ?,
                        tag = ?,
                        localization = ?,
                        sector = ?,
                        hostname = ?,
                        serie = ?,
                        model = ?
                    WHERE id = ?
                `

            }else{


                query =`
                    INSERT INTO tb_itens (description, quantity, patrimony, tag,localization,sector,hostname,serie,model)
                    VALUES(?,?,?,?,?,?,?,?,?)
                `


            }
            conn.query(query, params, (err, results)=> {

                if(err){
                    reject(err)
                }else{

                    resolve(results)
                }
            })
        })
    },

    delete(id){
        return new Promise((resolve, reject) => {
            conn.query(`
                DELETE FROM tb_itens WHERE id = ?
                `, [
                    id
                ], (err, results) =>{
                    if(err){
                        reject(err)
                    }else{
                        resolve(results)
                    }
                })
        })

    }
}