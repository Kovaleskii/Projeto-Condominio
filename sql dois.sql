create database Condominio;
use condominio;

create table Blocos(
idBloco int auto_increment primary key,
nomeBloco varchar(40) unique not null,
qntdApartamento int
);

CREATE TABLE Moradores (
idMorador INT AUTO_INCREMENT PRIMARY KEY,
nomeMorador VARCHAR(255) NOT NULL,
cpfMorador VARCHAR(11) UNIQUE NOT NULL,
telefoneMorador VARCHAR(20),
idBloco INT NOT NULL,
FOREIGN KEY (idBloco) REFERENCES Blocos(idBloco)
);

create table Apartamentos(
idApartamento INT AUTO_INCREMENT PRIMARY KEY,
numeroDoAp INT NOT NULL,
idBloco INT NOT NULL,
idMorador INT  NOT NULL,
FOREIGN KEY (idBloco) REFERENCES Blocos(idBloco),
FOREIGN KEY (idMorador) REFERENCES Moradores(idMorador),
UNIQUE (numeroDoAp, idBloco)
);

create table pagamento(
idApartamento INT NOT NULL,
cpfMorador VARCHAR(11) UNIQUE NOT NULL,
nomeMorador varchar(25) not null,
idBloco INT NOT NULL,
idMorador INT  NOT NULL,
dataFatura date,
valorFatura decimal,
vencimento date,
FOREIGN KEY (idBloco) REFERENCES Blocos(idBloco),
FOREIGN KEY (idMorador) REFERENCES Moradores(idMorador)
);

create table manutencao(
tipoDeManutencao varchar(255),
dataDaManutencao date,
localDaManutencao varchar(255)
);

INSERT INTO Blocos (nomeBloco, qntdApartamento) VALUES ('Bloco A', 10), ('Bloco B', 12), ('Bloco C', 8);
select * from blocos;
