const express = require('express'); // framework web para node.js - criar servidor 
const app = express(); // instancia o express
const mysql = require('mysql2'); // biblioteca para conexão com o banco de dados
const bodyParser = require("body-parser"); // middleware para análise de corpos de requisição
const { connect } = require('http2');


// configurando a conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'condominio', 
    port: 3306
});

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));


connection.connect(function(err){
    if(err){    
        console.error("Erro", err);
        return
    } console.log("Conexão OK! ")
});

app.get("/", function(req, res){
    res.sendFile(__dirname + "/public/html/home.html")
});

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
                            <a href="/apartamentos">Apartamentos</a> |
                            <a href="/moradores">Moradores</a> |
                            <a href="/pagamentos">Pagamentos</a> |
                            <a href="manutencoes.html">Manutenções</a>
                        </nav>
                    </header>

                    <main>
                        
                            <h2>Pesquisar Blocos</h2>

                        <form action="/pesquisarBlocos" method="POST">
                        <input type="text" name="pesquisarBlocos" id="pesquisarBlocos" placeholder="Digite o nome do bloco">
                        <button type="submit">Pesquisar</button>
                        </form>

                        <form action="/cadastrarBlocos" method="GET">
                        <button type="submit"> Novo bloco</a></button>
                        </form>
                    
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

app.get('/editar/:idBloco', function(req, res){ 
    const idBloco = req.params.idBloco;
    const select = "SELECT * FROM Blocos WHERE idBloco = ?";
   
    connection.query(select, [idBloco], function(err, rows){
        if(!err){
            console.log("Produto encontrado com sucesso!");
            res.send(`
                <html>
                    <head>
                    <link rel="stylesheet" href="css/style.css">
                        <title> Editar Bloco </title>
                    </head>
                    <body>
                        <h1>Editar Bloco</h1>
                        <form action="/editar/${idBloco}" method="POST">

                         <label for="idBloco">ID Do Bloco :</label><br>
                            <input type="number" name="idBloco" value="${rows[0].idBloco}"><br><br>

                            <label for="nomeBloco">Nome Do Bloco:</label><br>
                            <input type="text" name="nomeBloco" value="${rows[0].nomeBloco}"><br><br>

                            <label for="qntdApartamento"> Quantidade De Apartamento:</label><br>
                            <input type="number" name="qntdApartamento" value="${rows[0].qntdApartamento}"><br><br>
                            <input type="submit" value="Salvar"><Br> <Br>
                            <a href="/">Voltar</a>

                        </form>
                    </body>
                </html>`);
        }else{
            console.log("Erro ao buscar o produto ", err);
            res.send("Erro")
        }
    });
 
});

app.post('/pesquisarBlocos', function(req, res) {
    
    const pesquisarBlocos = req.body.pesquisarBlocos;
    const nomeBloco = req.body.nomeBloco;
    const select = "SELECT * FROM Blocos WHERE nomeBloco = ?";

    connection.query(select, [pesquisarBlocos], function(err, results) {
        if (err) {
            console.error("Erro ao buscar dados:", err);
            return res.status(500).send("Erro ao buscar dados");
        }

        if (results.length === 0) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="css/style.css">
                    <title>Bloco Não Encontrado</title>
                </head>
                <body>
                    <h1>Bloco não encontrado</h1>
                    <p>Insira um nome de bloco válido.</p>
                    <a href="/">Voltar</a>
                </body>
                </html>
            `);
        }

        const bloco = results[0];
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="css/style.css">
                <title>Detalhes do Bloco</title>
            </head>
            <body>
                <h1>Informações do Bloco</h1>
                <ul>
                    <li><strong>ID do Bloco:</strong> ${bloco.idBloco}</li>
                    <li><strong>Nome do Bloco:</strong> ${bloco.nomeBloco}</li>
                    <li><strong>Quantidade de Apartamentos:</strong> ${bloco.qntdApartamento}</li>
                </ul>
                <a href="/">Voltar</a>
            </body>
            </html>
        `);
    });
});

app.post('/editar/:idBloco', function(req, res){
    const nomeBloco = req.body.nomeBloco; 
    const qntdApartamento= req.body.qntdApartamento; 
    const idBloco = req.body.idBloco; 
 
    const update = "UPDATE Blocos SET nomeBloco = ?, qntdApartamento = ? WHERE idBloco = ?";
 
    connection.query(update, [nomeBloco,qntdApartamento, idBloco], function(err, result){
        if(!err){
            console.log("Blocos editado com sucesso!");
            res.redirect('/blocos'); 
        }else{
            console.log("Erro ao editar o bloco ", err);
            res.send("Erro")
        }
    });
});


app.get("/cadastrarBlocos", function(req, res){
    res.sendFile(__dirname + "/public/html/cadastrar.html")
});


app.post('/cadastrarBlocos' , function(req, res){

    const nomeBloco = req.body.nomeBloco;
    const qntdApartamento = req.body.qntdApartamento;

   // manda tudo pro banco de dados
    const values = [nomeBloco,qntdApartamento ];
    const insert = "insert into Blocos (nomeBloco, qntdApartamento) values (?, ?)";

    connection.query(insert, values, function(err, result){
        if(!err){
            console.log("Bloco inseridos com sucesso")
            res.redirect('/blocos');
            
    
        }else{
            console.log("Não foi possivel inserir os dados", err);
            res.send("Erro!")
        }
    })
});

app.get("/excluir/:idBloco", function(req, res){
    const idBloco = req.params.idBloco;

    //execulta a consulta para excluir o bloco com o ID correto
    connection.query('DELETE FROM Blocos WHERE idBloco = ?', [idBloco], function(err, result){
        if (err){
            console.error('Erro ao excluir o bloco: ', err);
            res.status(500).send ('Erro interno ao excluir o bloco. ')
            return;
        }
        console.log("Bloco excluído com sucesso! ");
        res.redirect('/blocos'); 
    })
    
});



app.get('/apartamentos', function(req, res){
    const listar = "SELECT b.nomeBloco, a.numeroDoAp, a.idApartamento FROM Apartamentos a JOIN Blocos b ON a.idBloco = b.idbloco"

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
                        <h1>Gerenciamento de Apartamentos</h1>
                        <nav>
                            <a href="/">Início</a> |
                            <a href="/blocos">Blocos</a> |
                            <a href="/moradores">Moradores</a> |
                            <a href="/pagamentos">Pagamentos</a> |
                            <a href="manutencoes.html">Manutenções</a>
                        </nav>
                    </header>

                    <main>
                        
                            <h2>Pesquisar Apartamentos</h2>

                        <form action="/pesquisarAp" method="POST">
                        <input type="text" name="pesquisarAp" id="pesquisarAp" placeholder="Digite o numero do apartamento ">
                        <button type="submit">Pesquisar</button>
                        </form>

                        <form action="/cadastrarAp" method="GET">
                        <button type="submit"> Novo Apartamento</a></button>
                        </form>

                        <section id="lista-apartamentos">
                            <h2>Lista de Aparatmentos</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome Do Bloco</th>
                                        <th>Numero Do Apartamento</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows.map(row => `
                                        <tr>
                                            <td>${row.nomeBloco}</td>
                                            <td>${row.numeroDoAp}</td>
                                            <td>
                                                <a href="/excluirAp/${row.idApartamento}">Remover</a>
                                                <a href="/editarAp/${row.idApartamento}">Editar</a>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                    </main>

                    <footer>
                        <a href="/apartamentos">Voltar</a>
                    </footer>
                </body>
                </html>
            `); 
            }else{
                console.log("Erro no cadastro ", err);
                res.send("Erro ")

            }
    })
});

app.post('/cadastrarAp' , function(req, res){

   // manda tudo pro banco de dados
   const numeroDoAp = req.body.numeroDoAp;
   const idBloco = req.body.idBloco;
   
   const insert = "INSERT INTO Apartamentos (numeroDoAp, idBloco) VALUES (?, ?)";
   connection.query(insert, [numeroDoAp, idBloco], function(err, result) {
    if(!err){
        console.log("Apartamentos inseridos com sucesso")
        res.redirect('/apartamentos');
        

    }else{
        console.log("Não foi possivel inserir os dados", err);
        res.send("Erro!")
    }
   });
});
    
app.get("/cadastrarAp", function(req, res) {
    const query = "SELECT * FROM Blocos";

    connection.query(query, function(err, blocos) {
        if (err) {
            console.log("Erro ao buscar blocos:", err);
            return res.send("Erro ao carregar blocos.");
        }

        let opcoes = blocos.map(bloco =>
            `<option value="${bloco.idBloco}">${bloco.nomeBloco}</option>`
        ).join("");

        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="css/style.css">
                <title>Cadastrar Apartamentos</title>
            </head>
            <body>
                <h2>Cadastrar Apartamento</h2>
                <form action="/cadastrarAp" method="POST">
                    <label for="idBloco">Bloco:</label>
                    <select name="idBloco" id="idBloco" required>
                        <option value="">Selecione um bloco</option>
                        ${opcoes}
                    </select>
                    
                    <label for="numeroDoAp">Número do Apartamento:</label>
                    <input type="text" id="numeroDoAp" name="numeroDoAp" required>

                    <button type="submit">Cadastrar</button>
                </form>
            </body>
            </html>
        `);
    });
})

app.post('/pesquisarAp', function(req, res) {
    
    const pesquisarAp = req.body.pesquisarAp;
    const nomeBloco = req.body.nomeBloco;
    const select = "SELECT b.nomeBloco, a.numeroDoAp, a.idApartamento FROM Apartamentos a JOIN Blocos b ON a.idBloco = b.idBloco where numeroDoAp = ?"

    connection.query(select, [pesquisarAp], function(err, results) {
        if (err) {
            console.error("Erro ao buscar dados:", err);
            return res.status(500).send("Erro ao buscar dados");
        }
        

        if (results.length === 0) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="css/style.css">
                    <title>Apartamento Não Encontrado</title>
                </head>
                <body>
                    <h1>Apartamento não encontrado</h1>
                    <p>Insira um numero de um Apartamento válido.</p>
                    <a href="/">Voltar</a>
                </body>
                </html>
            `);
        }

        const apartamento = results[0];
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="css/style.css">
                <title>Detalhes do Bloco</title>
            </head>
            <body>
                <h1>Informações do Bloco</h1>
                <ul>
                    <li><strong>Nome do Bloco:</strong> ${apartamento.nomeBloco}</li>
                    <li><strong>Numero do apartamento:</strong> ${apartamento.numeroDoAp}</li>
                </ul>
                <a href="/">Voltar</a>
            </body>
            </html>
        `);
    });
});

app.get("/excluirAp/:idApartamento", function(req, res){
    const idApartamento = req.params.idApartamento;

    //execulta a consulta para excluir o bloco com o ID correto
    connection.query('DELETE FROM Apartamentos WHERE idApartamento = ?', [idApartamento], function(err, result){
        if (err){
        console.error('Erro ao excluir o apartamento: ', err);
        res.status(500).send ('Erro interno ao excluir o apartamento. ')
        return;
        }
        console.log("Apartamento excluído com sucesso! ");
        res.redirect('/apartamentos'); 
    })
    
});

app.get('/editarAp/:idApartamento', function(req, res) {
    
    const idApartamento = req.params.idApartamento;
    const selectApartamento = "SELECT * FROM Apartamentos WHERE idApartamento = ?";
    const selectBlocos = "SELECT * FROM Blocos";

    connection.query(selectApartamento, [idApartamento], function(err, aptoRows) {
        if (err) {
            console.log("Erro ao buscar o apartamento:", err);
            return res.send("Erro ao buscar o apartamento.");
        }

        if (aptoRows.length === 0) {
            return res.send("Apartamento não encontrado.");
        }
        const apartamento = aptoRows[0];
        connection.query(selectBlocos, function(err, blocosRows) {
            if (err) {
                console.log("Erro ao buscar blocos:", err);
                return res.send("Erro ao buscar blocos.");
            }
            let opcoes = blocosRows.map(bloco => {
                const selected = bloco.idBloco === apartamento.idBloco ? "selected" : "";
                return `<option value="${bloco.idBloco}" ${selected}>${bloco.nomeBloco}</option>`;
            }).join("");

            res.send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <link rel="stylesheet" href="css/style.css">
                    <title>Editar Apartamento</title>
                </head>
                <body>
                    <h1>Editar Apartamento</h1>
                    <form action="/editarAp/${idApartamento}" method="POST">

                        <label for="numeroDoAp">Número do Apartamento:</label><br>
                        <input type="text" name="numeroDoAp" value="${apartamento.numeroDoAp}" required><br><br>

                        <label for="idBloco">Bloco:</label><br>
                        <select name="idBloco" required>
                            <option value="">Selecione um bloco</option>
                            ${opcoes}
                        </select><br><br>
                        <input type="submit" value="Salvar"><br><br>

                        <a href="/apartamentos">Voltar</a>
                        

                    </form>
                </body>
                </html>
            `);
        });
    });
});


app.post('/editarAp/:idApartamento', function(req, res){

    const idBloco = req.body.idBloco;
    const numeroDoAp = req.body.numeroDoAp; 
    const idApartamento = req.params.idApartamento; 
    const update = "UPDATE Apartamentos SET numeroDoAp = ?, idBloco = ? WHERE idApartamento = ?";
 
    connection.query(update, [numeroDoAp,idBloco, idApartamento], function(err, result){
        if(!err){
            console.log("Apartamentos editados com sucesso!");
            res.redirect('/apartamentos'); 
        }else{
            console.log("Erro ao editar o apartamento ", err);
            res.send("Erro")
        }
    });
});


app.get('/moradores', function(req, res){
    const listar = "SELECT m.idMorador , m.cpfMorador AS cpf, m.nomeMorador AS nome, a.numeroDoAp AS apartamento, b.nomeBloco AS bloco FROM Moradores m JOIN Apartamentos a ON m.idApartamento = a.idApartamento JOIN Blocos b ON a.idBloco = b.idBloco ORDER BY bloco;"

    connection.query(listar, function(err, results){
        if(err){
        return res.status(500).send('Erro ao buscar os dados')
        }

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
                    <h1>Gerenciamento de Moradores</h1>
                    <nav>
                        <a href="/">Início</a> |
                        <a href="/blocos">Blocos</a> |
                        <a href="/apartamentos">Apartamentos</a> |
                        <a href="/pagamentos">Pagamentos</a> |
                        <a href="/manutencoes.html">Manutenções</a>
                    </nav>
                </header>

                <main>
                    <h2>Pesquisar Morador</h2>
                    <form action="/pesquisarMoradores" method="POST">
                        <input type="text" name="pesquisarMoradores" id="pesquisarMoradores" placeholder="Digite o nome do morador">
                        <button type="submit">Pesquisar</button>
                    </form>

                    <form action="/cadastrarMoradores" method="GET">
                        <button type="submit">Novo Morador</button>
                    </form>

                    <section id="lista-moradores">
                        <h2>Lista de Moradores</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>CPF</th>
                                    <th>Morador</th>
                                    <th>Bloco</th>
                                    <th>Nº do Apartamento</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${results.map(row => `
                                    <tr>
                                        <td>${row.cpf}</td>
                                        <td>${row.nome}</td>
                                        <td>${row.bloco}</td>
                                        <td>${row.apartamento}</td>
                                        <td>
                                            <a href="/excluirMoradores/${row.idMorador}">Remover</a>
                                            <a href="/editarMoradores/${row.idMorador}">Editar</a>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </section>
                </main>

                <footer>
                    <a href="/moradores">Voltar</a>
                </footer>
            </body>
            </html>
        `); 
    });         
});


app.get("/cadastrarMoradores", function(req, res) {
    const blocoSelecionado = req.query.idbloco;

    const mostrarBlocos = "SELECT idBloco, nomeBloco FROM Blocos";
    const mostrarAp = "SELECT idApartamento, numeroDoAp FROM Apartamentos WHERE idBloco = ?";

    connection.query(mostrarBlocos, function(err, blocos) {
        if (err) {
            return res.status(500).send('Erro ao buscar blocos');
        }

        let blocosOptions = blocos.map(row => {
            const selected = blocoSelecionado == row.idBloco ? "selected" : "";
            return `<option value="${row.idBloco}" ${selected}>${row.nomeBloco}</option>`;
        }).join("");

        if (blocoSelecionado) {
            connection.query(mostrarAp, [blocoSelecionado], function(err, apartamentos) {
                if (err) {
                    return res.status(500).send('Erro ao buscar apartamentos');
                }

                let apOptions = apartamentos.map(ap => {
                    return `<option value="${ap.idApartamento}">${ap.numeroDoAp}</option>`;
                }).join("");

                res.send(`
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8">
                        <link rel="stylesheet" href="css/style.css">
                        <title>Cadastrar Morador</title>
                    </head>
                    <body>
                        <h2>Cadastrar Morador</h2>

                        <form action="/cadastrarMoradores" method="GET">
                            <label for="idbloco">Selecione o Bloco:</label>
                            <select name="idbloco" id="idbloco" required onchange="this.form.submit()">
                                <option value="">Selecione um bloco</option>
                                ${blocosOptions}
                            </select>
                        </form>

                      <form action="/cadastrarMoradores" method="POST">
                            <label for="cpf">CPF(SÓ NUMEROS):</label>
                            <input type="text" name="cpf" id="cpf" required>

                            <label for="nome">Nome:</label>
                            <input type="text" name="nome" id="nome" required>

                            <label for="telefoneMorador">Telefone:</label>
                            <input type="text" name="telefoneMorador" id="telefoneMorador" required>

                            <label for="idApartamento">Apartamento:</label>
                            <select name="idApartamento" id="idApartamento" required>
                                <option value="">Selecione um apartamento</option>
                                
                                ${apOptions}
                                 <input type="hidden" name="idBloco" value="${blocoSelecionado}">
                           
                            </select>  
                            <label for="responsavel">Responsável pelo Apt?</label>
                            <select id="responsavel" name="responsavel" required>
                                <option value="1">Sim</option>
                                <option value="2" selected>Não</option>
                            </select>
                            <label for="dono">Proprietário do Apt?</label>
                            
                            <select id="dono" name="dono" required>
                                <option value="1">Sim</option>
                                <option value="2" selected>Não</option>
                            </select>
                            
                            <label for="carro">Possui Veículo?</label>
                            <select id="carro" name="carro" onchange="mostrarCamposVeiculo(this.value)">
                                <option value="2" selected>Não</option>
                                <option value="1">Sim</option>
                            </select>

                            <div id="camposVeiculo" style="display: none;">
                                <label for="vagas">Quantidade de Vagas:</label>
                                <input type="number" id="vagas" name="vagas" min="1">

                                <label for="numVaga">Número da Vaga:</label>
                                <input type="number" id="numVaga" name="numVaga" min="1">

                                <label for="placa">Placa:</label>
                                <input type="text" id="placa" name="placa">

                                <label for="marca">Marca:</label>
                                <input type="text" id="marca" name="marca">

                                <label for="modelo">Modelo:</label>
                                <input type="text" id="modelo" name="modelo">
                            </div>

                            <button type="submit">Cadastrar Morador</button>
                        </form>
                        <script>
                            function mostrarCamposVeiculo(valor) {
                                document.getElementById('camposVeiculo').style.display = valor === "1" ? 'block' : 'none';
                            }
                        </script>
                        </form>
                        </form>
                        <a href="/">Voltar</a>
                    </body>
                    </html>
                `);
            });
        } else {
            res.send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <link rel="stylesheet" href="css/style.css">
                    <title>Cadastrar Morador</title>
                </head>
                <body>
                    <h2>Cadastrar Morador</h2>

                    <form action="/cadastrarMoradores" method="GET">
                        <label for="idbloco">Selecione o Bloco:</label>
                        <select name="idbloco" id="idbloco" required onchange="this.form.submit()">
                            <option value="">Selecione um bloco</option>
                            ${blocosOptions}
                        </select>
                    </form>

                    <p>Selecione um bloco para exibir os apartamentos disponíveis.</p>
                    <a href="/">Voltar</a>
                </body>
                </html>
            `);
        }
    });
});

app.post('/cadastrarMoradores', function(req, res) {
    console.log(req.body);

    const cpfMorador = req.body.cpf;
    const nomeMorador = req.body.nome;
    const idApartamento = req.body.idApartamento;
    const idBloco = req.body.idBloco;
    const telefoneMorador = req.body.telefoneMorador;
    const responsavel = req.body.responsavel;
    const dono = req.body.dono;
    const carro = req.body.carro;
    const vagas = req.body.vagas || null;
    const numVaga = req.body.numVaga || null;
    const placa = req.body.placa || null;
    const marca = req.body.marca|| null;
    const modelo = req.body.modelo || null;

    const insertMorador = `
        INSERT INTO Moradores (nomeMorador, cpfMorador, telefoneMorador, idBloco, idApartamento) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const moradorValues = [nomeMorador, cpfMorador, telefoneMorador, idBloco, idApartamento];

    connection.query(insertMorador, moradorValues, function(err, result) {
        if (err) {
            console.log("Não foi possível inserir os dados:", err);
            return res.send(`
                <html>
                <head><link rel="stylesheet" href="css/style.css"></head>
                <body>
                    <h1>ERRO</h1>
                    <h2>Dados inseridos não estão conferindo.</h2>
                    <p>Para que um morador seja cadastrado com sucesso, siga os passos:</p>
                    <ul>
                        <li>Não insira um CPF repetido;</li>
                        <li>Não adicione mais de um proprietário ao mesmo apartamento;</li>
                    </ul>
                    <a href="/moradores">Voltar</a>
                </body>
                </html>
            `);
        }

        const idMorador = result.insertId;

        if (carro === "1" && placa && marca && modelo) {
            const insertVeiculo = `
                INSERT INTO Veiculos (placa, marca, modelo, idMorador, vagas, numeroVaga) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const valoresVeiculo = [placa, marca, modelo, idMorador, vagas, numVaga];

            connection.query(insertVeiculo, valoresVeiculo, function(err2) {
                if (err2) {
                    console.log("Erro ao cadastrar veículo:", err2);
                    return res.send("Morador cadastrado, mas erro ao cadastrar veículo.");
                }

                console.log("Morador e veículo cadastrados com sucesso!");
                res.redirect("/moradores");
            });
        } else {
            console.log("Morador cadastrado sem veículo.");
            res.redirect("/moradores");
        }
    });
});

app.get('/editarMoradores/:idMorador', function(req, res) {
    const idMorador = req.params.idMorador;

    const selectMorador = "SELECT * FROM Moradores WHERE idMorador = ?";
    const selectBlocos = "SELECT * FROM Blocos";
    const selectAps = "SELECT * FROM Apartamentos";
    const selectVeiculo = "SELECT * FROM Veiculos WHERE idMorador = ?";

    connection.query(selectMorador, [idMorador], function(err, moradorRows) {
        if (err || moradorRows.length === 0) {
            console.log("Erro ao buscar o morador:", err);
            return res.send("Morador não encontrado.");
        }

        const morador = moradorRows[0];

        connection.query(selectBlocos, function(err, blocosRows) {
            if (err) return res.send("Erro ao buscar blocos.");

            connection.query(selectAps, function(err, apsRows) {
                if (err) return res.send("Erro ao buscar apartamentos.");

                connection.query(selectVeiculo, [idMorador], function(err, veiculoRows) {
                    if (err) return res.send("Erro ao buscar veículo.");

                    const veiculo = veiculoRows.length > 0 ? veiculoRows[0]:{placa : '', marca: '', modelo: '', vagas: '', numVaga: ''}

                    const blocoOptions = blocosRows.map(bloco => {
                        const selected = bloco.idBloco === morador.idBloco ? 'selected' : '';
                        return `<option value="${bloco.idBloco}" ${selected}>${bloco.nomeBloco}</option>`;
                    }).join("");

                    const apOptions = apsRows.map(ap => {
                        const selected = ap.idApartamento === morador.idApartamento ? 'selected' : '';
                        return `<option value="${ap.idApartamento}" ${selected}>${ap.numeroDoAp}</option>`;
                    }).join("");



                    res.send(`
                        <!DOCTYPE html>
                        <html lang="pt-BR">
                        <head>
                            <meta charset="UTF-8">
                            <link rel="stylesheet" href="css/style.css">
                            <title>Editar Morador</title>
                        </head>
                        <body>
                            <h1>Editar Morador</h1>
                            <form action="/editarMoradores/${idMorador}" method="POST">
                                <label>Nome:</label><br>
                                <input type="text" name="nomeMorador" value="${morador.nomeMorador}" required><br><br>

                                <label>CPF:</label><br>
                                <input type="text" name="cpfMorador" value="${morador.cpfMorador}" required><br><br>

                                <label>Telefone:</label><br>
                                <input type="text" name="telefoneMorador" value="${morador.telefoneMorador}" required><br><br>

                                <label>Bloco:</label><br>
                                <select name="idBloco" required>${blocoOptions}</select><br><br>

                                <label>Apartamento:</label><br>
                                <select name="idApartamento" required>${apOptions}</select><br><br>

                                <label>Possui Veículo?</label><br>
                                <select name="carro" onchange="toggleVeiculo(this.value)">
                                    <option value="1" ${veiculoRows.length > 0 ? 'selected' : ''}>Sim</option>
                                    <option value="2" ${veiculoRows.length === 0 ? 'selected' : ''}>Não</option>
                                </select><br><br>

                                <div id="camposVeiculo" style="display: ${veiculoRows.length > 0 ? 'block' : 'none'};">
                                    <h2>Editar Veículo</h2>
                                    <label>Placa:</label><br>
                                    <input type="text" name="placa" value="${veiculo.placa}"><br><br>

                                    <label>Marca:</label><br>
                                    <input type="text" name="marca" value="${veiculo.marca}"><br><br>

                                    <label>Modelo:</label><br>
                                    <input type="text" name="modelo" value="${veiculo.modelo}"><br><br>

                                    <label>Quantidade de Vagas:</label><br>
                                    <input type="number" name="vagas" value="${veiculo.vagas}"><br><br>

                                    <label>Número da Vaga:</label><br>
                                    <input type="number" name="numeroVaga" value="${veiculo.numeroVaga}"><br><br>
                                </div>

                                <input type="submit" value="Salvar">
                            </form>
                            <br><a href="/moradores">Voltar</a>

                            <script>
                                function toggleVeiculo(valor) {
                                    document.getElementById('camposVeiculo').style.display = valor === "1" ? 'block' : 'none';
                                }
                            </script>
                        </body>
                        </html>
                    `);
                });
            });
        });
    });
});

app.post('/editarMoradores/:idMorador', function(req, res) {
        const idMorador = req.params.idMorador;
        const nomeMorador = req.body.nomeMorador;
        const cpfMorador = req.body.cpfMorador;
        const telefoneMorador = req.body.telefoneMorador;
        const idBloco = req.body.idBloco;
        const idApartamento = req.body.idApartamento;
    
        const placa = req.body.placa || null;
        const marca = req.body.marca || null;
        const modelo = req.body.modelo || null;
        const vagas = req.body.vagas || null;
        const numeroVaga = req.body.numeroVaga || null;
        const carro = req.body.carro || "2"; //2 nao 1 sim
    
       
        const updateMorador = "UPDATE Moradores SET nomeMorador = ?, cpfMorador = ?, telefoneMorador = ?, idBloco = ?, idApartamento = ? WHERE idMorador = ?";
        
    
        const moradorValues = [nomeMorador, cpfMorador, telefoneMorador, idBloco, idApartamento, idMorador];
    
        connection.query(updateMorador, moradorValues, function(err) {
            if (err) {
                console.log("Erro ao atualizar morador:", err);
                return res.send("Erro ao editar morador.");
            }
    
            
            if (carro === "1") {
                const updateVeiculo = "UPDATE Veiculos SET placa = ?, marca = ?, modelo = ?, vagas = ?, numeroVaga = ? WHERE idMorador = ?";
                
                const veiculoValues = [placa, marca, modelo, vagas, numeroVaga, idMorador];
    
                connection.query(updateVeiculo, veiculoValues, function(err2, result) {
                    if (err2) {
                        console.log("Erro ao atualizar veículo:", err2);
                        return res.send("Morador editado, mas houve erro ao editar o veículo.");
                    }
    
                    console.log("Morador e veículo editados com sucesso!");
                    res.redirect("/moradores");
                });
            } else {
                console.log("Morador editado sem alteração de veículo.");
                res.redirect("/moradores");
            }
        });
    });

app.get("/excluirMoradores/:idMorador", function(req, res) {
    const idMorador = req.params.idMorador;
    const excluirVeiculos = "DELETE FROM Veiculos WHERE idMorador = ?";
    const excluirMorador = "DELETE FROM Moradores WHERE idMorador = ?";
    

    connection.query(excluirVeiculos, [idMorador], function(err) {
        if (err) {
            console.error("Erro ao excluir veículo:", err);
            return res.status(500).send("Erro ao excluir veículo do morador.");
        }

    connection.query(excluirMorador, [idMorador], function(err, result) {
        if (err) {
            console.error("Erro ao excluir o morador:", err);
            return res.status(500).send("Erro interno ao excluir o morador.");
        }

        console.log("Morador excluído com sucesso!");
        res.redirect("/moradores"); 
        });
    });
});

app.post("/pesquisarMoradores", function(req, res) { 
    
    
    const pesquisarMoradores = req.body.pesquisarMoradores;
    const nomeBloco = req.body.nomeBloco;
    const numeroDoAp = req.body.numeroDoAp
    const select = `SELECT m.nomeMorador, m.cpfMorador, m.telefoneMorador, b.nomeBloco, a.numeroDoAp, v.placa, v.marca, v.modelo, v.vagas, v.numerovaga 
   FROM Moradores m JOIN Apartamentos a ON m.idApartamento = a.idApartamento JOIN Blocos b ON a.idBloco = b.idBloco LEFT JOIN Veiculos v ON m.idMorador = v.idMorador WHERE m.nomeMorador LIKE CONCAT('%', ?, '%');`

    
    console.log(pesquisarMoradores)

    connection.query(select, [pesquisarMoradores], function(err, results) {
        if (err) {
            console.error("Erro ao buscar dados:", err);
            return res.status(500).send("Erro ao buscar dados");

        }
        if (results.length === 0) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="css/style.css">
                    <title>Morador Não Encontrado</title>
                </head>
                <body>
                    <h1>Morador não encontrado</h1>
                    <p>Insira um nome de um Morador válido.</p>
                    <a href="/">Voltar</a>
                </body>
                </html>
            `);
        }

        const morador = results[0];
        const temVeiculo = morador.placa || morador.marca || morador.modelo || morador.vagas|| morador.numVaga
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="css/style.css">
                <title>Detalhes do Bloco</title>
            </head>
            <body>
                <h1>Informações do Bloco</h1>
                <ul>

                    <li><strong>Cpf do morador:</strong> ${morador.cpfMorador}</li>
                    <li><strong>Nome do morador:</strong> ${morador.nomeMorador}</li>
                    <li><strong>Telefone do morador:</strong> ${morador.telefoneMorador}</li>
                    <li><strong>Bloco do morador:</strong> ${morador.nomeBloco}</li>
                    <li><strong>Numero do apartamento:</strong> ${morador.numeroDoAp}</li>
                         ${temVeiculo ? `
                    <li><strong>Placa:</strong> ${morador.placa}</li>
                    <li><strong>Marca:</strong> ${morador.marca}</li>
                    <li><strong>Modelo:</strong> ${morador.modelo}</li>
                    <li><strong>Qtd Vagas:</strong> ${morador.vagas}</li>
                    <li><strong>Número da Vaga:</strong> ${morador.numeroVaga}</li>
                    ` : `<li><strong>Veículo:</strong> Nenhum cadastrado</li>`}
                </ul>
                <a href="/">Voltar</a>
            </body>
            </html>
        `);
    });
});

app.get("/pagamentos", function(req, res) {

    const blocoSelecionado = req.query.idbloco;
    const ApSelecionado = req.query.idApartamento;
    const mes = req.query.mesMostrado || String(new Date().getMonth() + 1).padStart(2, '0');
    const ano = req.query.anoMostrado || new Date().getFullYear();

    const mostrarMorador = "SELECT idMorador, cpfMorador, nomeMorador, idApartamento, telefoneMorador FROM Moradores WHERE idApartamento = ?";
    const mostrarBlocos = "SELECT idBloco, nomeBloco AS descricao FROM Blocos";
    const mostrarAp = "SELECT idApartamento, numeroDoAp AS numeroApartamento FROM Apartamentos WHERE idBloco = ?";
    const referencia = "SELECT idReferencia, vencimento, valor FROM Referencia WHERE MONTH(vencimento) = ? AND YEAR(vencimento) = ?";

    connection.query(mostrarBlocos, function(err, blocos) {
        if (err) return res.status(500).send("Erro ao buscar blocos");

        if (!blocoSelecionado) {
            const blocosHtml = blocos.map(b => `<option value="${b.idBloco}">${b.descricao}</option>`).join("");
            return res.send(`
                 <link rel="stylesheet" href="css/style.css">
                <form method="GET" action="/pagamentos">
                    <label for="idbloco">Selecione o Bloco:</label>
                    <select name="idbloco" onchange="this.form.submit()">
                        <option value="">-- Escolha --</option>
                        ${blocosHtml}
                    </select>
                </form>
            `);
        }

        connection.query(mostrarAp, [blocoSelecionado], function(err, apartamentos) {
            if (err) return res.status(500).send("Erro ao buscar apartamentos");

            const apartamentosHtml = apartamentos.map(ap => `<option value="${ap.idApartamento}">${ap.numeroApartamento}</option>`).join("");
            if (!ApSelecionado) {
                return res.send(`
                    <link rel="stylesheet" href="css/style.css">
                    <form method="GET" action="/pagamentos">
                        <input type="hidden" name="idbloco" value="${blocoSelecionado}">
                        <label for="idApartamento">Selecione o Apartamento:</label>
                        <select name="idApartamento" onchange="this.form.submit()">
                            <option value="">-- Escolha --</option>
                            ${apartamentosHtml}
                        </select>
                    </form>
                `);
            }

            connection.query(mostrarMorador, [ApSelecionado], function(err, moradorRows) {
                if (err) return res.status(500).send("Erro ao buscar morador");

                const morador = moradorRows.length > 0 ? moradorRows[0] : null;

                connection.query(referencia, [mes, ano], function(err, reference) {
                    if (err) return res.status(500).send("Erro ao buscar referências");

                    const referenciasHtml = reference.map(r => `
                        <li>Vencimento: ${r.vencimento}, Valor: R$${r.valor.toFixed(2)}</li>
                    `).join('');

                    res.send(`
                        <!DOCTYPE html>
                        <html lang="pt-BR">
                        <link rel="stylesheet" href="css/style.css">
                        <head><meta charset="UTF-8"><title>Pagamento</title></head>
                        <body>
                            <h1>Pagamento do Morador</h1>
                            ${morador ? `
                                <p><strong>Nome:</strong> ${morador.nomeMorador}</p>
                                <p><strong>CPF:</strong> ${morador.cpfMorador}</p>
                                <p><strong>Telefone:</strong> ${morador.telefoneMorador}</p>
                                <p><strong>Apartamento:</strong> ${morador.idApartamento}</p>
                            ` : `<p>Morador não encontrado.</p>`}

                            <h2>Referências de ${mes}/${ano}</h2>
                            <ul>${referenciasHtml}</ul>

                            <form action="/registrarPagamento" method="POST">
                                <input type="hidden" name="idApartamento" value="${ApSelecionado}">
                                <input type="hidden" name="idMorador" value="${morador ? morador.idMorador : ''}">
                                <input type="hidden" name="idBloco" value="${blocoSelecionado}">
                                <input type="hidden" name="idReferencia" value="${reference.length > 0 ? reference[0].idReferencia : ''}">
                                <input type="submit" value="Registrar Pagamentos">
                            </form>

                            <a href="/">Voltar</a>
                        </body>
                        </html>
                    `);
                });
            });
        });
    });
});

app.post("/registrarPagamento", function(req, res) {
    const { idApartamento, idMorador, idBloco, idReferencia } = req.body;

    const insert = "INSERT INTO Pagamento (idApartamento, idMorador, idBloco, idReferencia) VALUES (?,?,?,?)";
    const values = [idApartamento, idMorador, idBloco, idReferencia];

    if (!idMorador || !idApartamento || !idBloco) {
        return res.status(400).send("Erro: idMorador, idApartamento ou idBloco não pode estar vazio.");
    }

    connection.query(insert, values, function(err) {
        if (err) {
            console.log("Erro ao registrar pagamento:", err);
            return res.status(500).send("Erro ao registrar pagamento.");
        }

        console.log("Pagamento registrado com sucesso!");
        res.redirect("/");
    });
});

app.get("/cadastroManutencao", function(req, res) {
    const mostrarTiposManutencao = "SELECT tipoDeManutencao FROM Manutencao GROUP BY tipoDeManutencao";

    connection.query(mostrarTiposManutencao, function(err, tipos) {
        if (err) {
            return res.status(500).send("Erro ao buscar tipos de manutenção.");
        }

        const tiposHtml = tipos.map(tipo => `<option value="${tipo.tipoDeManutencao}">${tipo.tipoDeManutencao}</option>`).join("");

        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head><meta charset="UTF-8"><title>Cadastrar Manutenção</title></head>
            <link rel="stylesheet" href="css/style.css">
            <body>
                <h1>Cadastro de Manutenção</h1>
                <form method="POST" action="/registrarManutencao">
                    <label for="tipoManutencao">Tipo de Manutenção:</label>
                    <select name="tipoManutencao" id="tipoManutencao" required>
                        <option value="">Selecione o Tipo</option>
                        ${tiposHtml}
                    </select>

                    <label for="dataManutencao">Data:</label>
                    <input type="date" name="dataManutencao" id="dataManutencao" required>

                    <label for="localManutencao">Local:</label>
                    <input type="text" name="localManutencao" id="localManutencao" required>

                    <label for="descManutencao">Descrição:</label>
                    <input type="text" name="descManutencao" id="descManutencao" required>

                    <button type="submit">Cadastrar</button>
                </form>
                <a href="/">Voltar</a>
            </body>
            </html>
        `);
    });
});


app.post("/registrarManutencao", function(req, res) {
    const { tipoManutencao, dataManutencao, localManutencao,descManutencao  } = req.body;

    
    const insert = "INSERT INTO Manutencao (tipoDeManutencao, dataDaManutencao, localDaManutencao, descManutencao) VALUES (?, ?, ?, ?)";
    const values = [tipoManutencao, dataManutencao, localManutencao, descManutencao];

    connection.query(insert, values, function(err) {
        if (err) {
            console.log("Erro ao registrar manutenção:", err);
            return res.status(500).send("Erro ao registrar manutenção.");
        }

        console.log("Manutenção registrada com sucesso!");
        res.redirect("/");  
    });
});




app.listen(8083, function(){
    console.log("Servidor rodando na url http://localhost:8083");
});
