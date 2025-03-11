CREATE DATABASE bateas;

CREATE TABLE bateas(
	id SERIAL primary key,
	name varchar(25),
	polygon varchar(25)
);

drop table bateas

insert into bateas (name, polygon) values ('Frangarbe', 'Arousa')	
insert into bateas (name, polygon) values ('Indemosa I', 'Arousa')
insert into bateas (name, polygon) values ('Luisa IV', 'Cambados')	

select * from bateas