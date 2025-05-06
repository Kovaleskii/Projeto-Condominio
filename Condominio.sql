CREATE DATABASE Condominio;
USE Condominio;

SET SQL_SAFE_UPDATES = 0; # tirar o modo seguro do sql

CREATE TABLE Blocos (
    idBloco INT AUTO_INCREMENT PRIMARY KEY,
    nomeBloco VARCHAR(40) UNIQUE NOT NULL,
    qntdApartamento INT
);


CREATE TABLE Apartamentos (
    idApartamento INT AUTO_INCREMENT PRIMARY KEY,
    numeroDoAp VARCHAR(10) NOT NULL,
    idBloco INT NOT NULL,
    UNIQUE (numeroDoAp, idBloco),
    FOREIGN KEY (idBloco) REFERENCES Blocos(idBloco)
);

CREATE TABLE Moradores (
    idMorador INT AUTO_INCREMENT PRIMARY KEY,
    nomeMorador VARCHAR(255) NOT NULL,
    cpfMorador VARCHAR(11) UNIQUE NOT NULL,
    telefoneMorador VARCHAR(20),
    idBloco INT NOT NULL,
    idApartamento INT NOT NULL,
    FOREIGN KEY (idBloco) REFERENCES Blocos(idBloco),
    FOREIGN KEY (idApartamento) REFERENCES Apartamentos(idApartamento)
);

CREATE TABLE Pagamento (
    idPagamento INT AUTO_INCREMENT PRIMARY KEY,
    idApartamento INT NOT NULL,
    cpfMorador VARCHAR(11) NOT NULL,
    nomeMorador VARCHAR(25) NOT NULL,
    idBloco INT NOT NULL,
    idMorador INT NOT NULL,
    dataFatura DATE,
    valorFatura DECIMAL(10,2),
    vencimento DATE,
    FOREIGN KEY (idBloco) REFERENCES Blocos(idBloco),
    FOREIGN KEY (idMorador) REFERENCES Moradores(idMorador),
    FOREIGN KEY (idApartamento) REFERENCES Apartamentos(idApartamento)
);

create table Referencia(
	idReferencia int auto_increment primary key,
    mes int,
    ano int,
    vencimento date,
    valor float
);
	
CREATE TABLE Manutencao (
    idManutencao INT AUTO_INCREMENT PRIMARY KEY,
    tipoDeManutencao VARCHAR(255),
    dataDaManutencao DATE,
    localDaManutencao VARCHAR(255)
);

CREATE TABLE Veiculos (
    idVeiculo INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10),
    marca VARCHAR(50),
    modelo VARCHAR(50),
    idMorador INT,
    vagas INT,
    numeroVaga INT,
    FOREIGN KEY (idMorador) REFERENCES Moradores(idMorador)
);

-- insert 
INSERT INTO Referencia (mes, ano, vencimento, valor) VALUES
(1, 2025, '2025-01-10', 800.00),
(2, 2025, '2025-02-10', 800.00),
(3, 2025, '2025-03-10', 800.00),
(4, 2025, '2025-04-10', 800.00),
(5, 2025, '2025-05-10', 800.00),
(6, 2025, '2025-06-10', 800.00),
(7, 2025, '2025-07-10', 800.00),
(8, 2025, '2025-08-10', 800.00),
(9, 2025, '2025-09-10', 800.00),
(10, 2025, '2025-10-10', 800.00),
(11, 2025, '2025-11-10', 800.00),
(12, 2025, '2025-12-10', 800.00);

select * from referencia;
select * from pagamento;

ALTER TABLE Pagamento
DROP COLUMN nomeMorador,
DROP COLUMN cpfMorador;

ALTER TABLE Pagamento
ADD COLUMN idReferencia INT,
ADD FOREIGN KEY (idReferencia) REFERENCES Referencia(idReferencia);

ALTER TABLE Pagamento
DROP COLUMN dataFatura,
DROP COLUMN valorFatura,
DROP COLUMN vencimento;
