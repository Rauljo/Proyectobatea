CREATE DATABASE bateas;

CREATE TABLE bateas(
	id SERIAL primary key,
	name varchar(25),
	poligon varchar(25)
);

drop table bateas

insert into bateas (name, poligon) values ('Frangarbe', 'Arousa')	
insert into bateas (name, poligon) values ('Indemosa I', 'Arousa')
insert into bateas (name, poligon) values ('Luisa IV', 'Cambados')	

select * from bateas