CREATE DATABASE bateas;

CREATE TABLE bateas(
	id SERIAL primary key,
	name varchar(25),
	polygon varchar(25),
	x_sector int,
	y_sector int
);

CREATE TABLE sectores(
	x int,
	y int,
	batea int,
	cuerdas_cria int,
	cuerdas_cultivo int,
	primary key (x,y,batea),
	foreign key(batea) references bateas(id)
)

drop table bateas
drop table sectores

insert into bateas (name, polygon, x_sector, y_sector) values ('Frangarbe', 'Arousa', 2, 3)	

insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (0,0,1,10,10)
insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (0,1,1,12,10)
insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (0,2,1,40,20)
insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (1,0,1,20,30)
insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (1,1,1,30,40)
insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (1,2,1,20,50)


insert into bateas (name, polygon, x_sector, y_sector) values ('Indemosa I', 'Arousa', 3, 2)
insert into bateas (name, polygon, x_sector, y_sector) values ('Luisa IV', 'Cambados', 4, 4)	

select * from bateas

select * from sectores where batea=6