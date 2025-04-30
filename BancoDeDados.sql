create database Condominio;
use condominio;

create table Blocos(
idBloco int auto_increment primary key,
nomeBloco varchar(40) unique not null,
qntdApartamento int not null
);

CREATE TABLE Moradores (
idMorador INT AUTO_INCREMENT PRIMARY KEY,
nomeMorador VARCHAR(255) NOT NULL,
cpfMorador CHAR(11) UNIQUE NOT NULL,
telefoneMorador VARCHAR(20)
);

create table Apartamentos(
idApartamento INT AUTO_INCREMENT PRIMARY KEY,
numeroDoAp INT NOT NULL,
idBloco INT NOT NULL,
idMorador INT,
FOREIGN KEY (idBloco) REFERENCES Blocos(idBloco),
FOREIGN KEY (idMorador) REFERENCES Moradores(idMorador),
UNIQUE (numeroDoAp, idBloco)
);
