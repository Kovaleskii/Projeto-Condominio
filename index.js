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



app.get('/blocos', function(req, res){
    const listar = "select * from blocos";

    connection.query(listar, function(err, rows){
        if(!err){
            res.send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <title>Relatório de Pesquisa</title>
                    <link rel="stylesheet" href="css/style.css">
                </head>
                <body> 
                    <header>
                        <h1>Gerenciamento de Blocos</h1>
                        <nav>
                            <a href="/">Início</a> |
                            <a href="apartamentos.html">Apartamentos</a> |
                            <a href="moradores.html">Moradores</a> |
                            <a href="pagamentos.html">Pagamentos</a> |
                            <a href="manutencoes.html">Manutenções</a>
                        </nav>
                    </header>

                    <main>
                        <section id="pesquisa-blocos">
                            <h2>Pesquisar Blocos</h2>
                            <input type="text" id="pesquisaInput" placeholder="Digite o nome do bloco">
                            <button type="submit">Pesquisar</button>
                            <button type="submit">Novo bloco</button>
                        </section>

                        <section id="lista-blocos">
                            <h2>Lista de Blocos</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID do Bloco</th>
                                        <th>Nome do Bloco</th>
                                        <th>Quantidade de Apartamentos</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows.map(row => `
                                        <tr>
                                            <td>${row.idBloco}</td>
                                            <td>${row.nomeBloco}</td>
                                            <td>${row.qntdApartamento}</td>
                                            <td>
                                                <a href="/excluir/${row.idBloco}">Remover</a>
                                                <a href="/editar/${row.idBloco}">Editar</a>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </section>

                        <section id="formulario-bloco" style="display: none;">
                            <h2 id="tituloFormulario">Cadastrar Novo Bloco</h2>
                            <form id="blocoForm">
                                <label for="nomeBloco">Nome do Bloco:</label>
                                <input type="text" id="nomeBloco" name="nomeBloco" required><br><br>

                                <label for="qntdApartamento">Quantidade de Apartamentos:</label>
                                <input type="number" id="qntdApartamento" name="qntdApartamento" required><br><br>

                                <button type="submit">Salvar</button>
                                <button type="button" onclick="fecharFormulario()">Cancelar</button>
                            </form>
                        </section>
                    </main>

                    <footer>
                        <a href="/">Voltar</a>
                    </footer>
                </body>
                </html>
            `); 
            }else{
                console.log("Erro no relatório de estoque ", err);
                res.send("Erro ")

            }
    })
});

// rota para cadastrar o bloco
app.post('/cadastrar' , function(req, res){
    
    
    //captura e armazenamento dos campos do formulario html
    const nomeBloco = req.body.nomeBloco;
    const quantidade = req.body.qntdApartamento;
   
   // manda tudo pro banco de dados
    const values = [nomeBloco,qntdApartamento];
    const insert = "insert into Blocos (nomeBloco, quantidade) values (?, ?)";

    connection.query(insert, values, function(err, result){
        if(!err){
            console.log("Bloco inseridos com sucesso")
            res.redirect('/');
    
        }else{
            console.log("Não foi possivel inserir os dados", err);
            res.send("Erro!")
        }
    })
});


app.get("/excluir/:id", function(req, res){
    const id = req.params.id;

    //execulta a consulta para excluir o bloco com o ID correto
    connection.query('DELETE FROM Blocos WHERE idBloco = ?', [id], function(err, result){
        if (err){
            console.error('Erro ao excluir o bloco: ', err);
            res.status(500).send ('Erro interno ao excluir o bloco. ')
            return;
        }
        console.log("Bloco excluído com sucesso! ");
        res.redirect('/blocos'); 
    })
    
});



app.listen(8083, function(){
    console.log("Servidor rodando na url http://localhost:8083");
});

