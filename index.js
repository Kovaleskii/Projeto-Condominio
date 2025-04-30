const express = require('express'); // framework web para node.js - criar servidor 
const app = express(); // instancia o express
const mysql = require('mysql2'); // biblioteca para conexão com o banco de dados
const bodyParser = require("body-parser"); // middleware para análise de corpos de requisição


// configurando a conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'condominio', 
    port: 3306
});

connection.connect(function(err){
    if(err){    
        console.error("Erro", err);
        return
    } console.log("Conexão OK! ")
});

app.get("/", function(req, res){
    res.sendFile(__dirname + "/public/html/home.html")
});

app.use(express.static('public'));


app.get("/blocos", function(req, res){
    res.sendFile(__dirname + "/public/html/blocos.html")
});

app.get('/listarBlocos', function(req, res){
    const listar = "select * from blocos";

    connection.query(listar, function(err, rows){
        if(!err){
            console.log("Pesquisa realizada com sucesso! ")
            res.send(`
    <html>
            <head> 
                <title> Relatório de pesquisa </title>
            </head>
            <body> 
                <h1> Relatório de pesquisa </h1>
                    <table> 
                        <tr> 
                            <th> idBloco </th>
                            <th> nomeBloco</th>
                            <th> qntdApartamento </th>
                        </tr>
                        ${rows.map(row => `
                            <tr> 
                                <td>${row.idBloco} </td>
                                <td>${row.nomeBloco} </td>
                                <td>${row.qntdApartamento} </td>
                                <td>
                                <a href="/excluir/${row.id}">Remover</a>
                                <a href="/editar/${row.id}">editar</a>
                                </td>
                                
                             
                            </tr>
                            `).join('')}
                    </table>
                    <a href="/"> Voltar </a>
            </body>
    </html>
                
                `) 
            }else{
                console.log("Erro no relatório de estoque ", err);
                res.send("Erro ")

            }
    })
});
app.listen(8083, function(){
    console.log("Servidor rodando na url http://localhost:8083");
});

