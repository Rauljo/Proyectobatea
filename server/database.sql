CREATE DATABASE bateas;

drop table movimientos;
drop table sectores;
drop table bateas;

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
	cuerdas_pesca int default 0,
	cuerdas_piedra int default 0,
	cuerdas_desdoble int default 0,
	cuerdas_comercial int default 0,
	primary key (x,y,batea),
	foreign key(batea) references bateas(id)
);

create table movimientos (
	id serial primary key,
	tipo_cuerda varchar(10) check (tipo_cuerda in ('pesca', 'piedra', 'desdoble', 'comercial')),
	cantidad int,
	operacion varchar(10) check (operacion in ('entrada', 'salida')),
	sector_x int,
	sector_y int,
	sector_batea int,
	fecha timestamp default current_timestamp,
	foreign key(sector_x, sector_y, sector_batea) references sectores(x,y,batea)
);

create or replace function actualizar_cuerdas_after_insert()
returns trigger as $$
begin
    if new.operacion = 'entrada' then
        if new.tipo_cuerda = 'pesca' then
            update sectores set cuerdas_pesca = cuerdas_pesca + new.cantidad
            where x = new.sector_x and y = new.sector_y and batea = new.sector_batea;
        elsif new.tipo_cuerda = 'piedra' then
            update sectores set cuerdas_piedra = cuerdas_piedra + new.cantidad
            where x = new.sector_x and y = new.sector_y and batea = new.sector_batea;
        elsif new.tipo_cuerda = 'desdoble' then
            update sectores set cuerdas_desdoble = cuerdas_desdoble + new.cantidad
            where x = new.sector_x and y = new.sector_y and batea = new.sector_batea;
        elsif new.tipo_cuerda = 'comercial' then
            update sectores set cuerdas_comercial = cuerdas_comercial + new.cantidad
            where x = new.sector_x and y = new.sector_y and batea = new.sector_batea;
        end if;

    elsif new.operacion = 'salida' then
        if new.tipo_cuerda = 'pesca' then
            update sectores set cuerdas_pesca = cuerdas_pesca - new.cantidad
            where x = new.sector_x and y = new.sector_y and batea = new.sector_batea;
        elsif new.tipo_cuerda = 'piedra' then
            update sectores set cuerdas_piedra = cuerdas_piedra - new.cantidad
            where x = new.sector_x and y = new.sector_y and batea = new.sector_batea;
        elsif new.tipo_cuerda = 'desdoble' then
            update sectores set cuerdas_desdoble = cuerdas_desdoble - new.cantidad
            where x = new.sector_x and y = new.sector_y and batea = new.sector_batea;
        elsif new.tipo_cuerda = 'comercial' then
            update sectores set cuerdas_comercial = cuerdas_comercial - new.cantidad
            where x = new.sector_x and y = new.sector_y and batea = new.sector_batea;
        end if;
    end if;

    return new;
end;
$$ language plpgsql;


create trigger actualizar_cuerdas_after_insert_trigger
after insert on movimientos 
for each row
execute function actualizar_cuerdas_after_insert();



insert into bateas (name, polygon, x_sector, y_sector) values ('Frangarbe', 'Arousa', 2, 3);

insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (0,0,1,10,10);
insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (0,1,1,12,10);
insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (0,2,1,40,20);
insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (1,0,1,20,30);
insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (1,1,1,30,40);
insert into sectores (x, y, batea, cuerdas_cria, cuerdas_cultivo) values (1,2,1,20,50);

select * from sectores where batea=1
select * from movimientos
--insert
insert into movimientos (id, tipo_cuerda, cantidad, operacion, sector_x, sector_y, sector_batea) values (1, 'cria', 10, 'entrada', 0, 0, 1);
insert into movimientos (id, tipo_cuerda, cantidad, operacion, sector_x, sector_y, sector_batea) values (2, 'cultivo', 10, 'entrada', 0, 0, 1);

--delete
insert into movimientos (id, tipo_cuerda, cantidad, operacion, sector_x, sector_y, sector_batea) values (3, 'cria', 5, 'salida', 0, 0, 1);
insert into movimientos (id, tipo_cuerda, cantidad, operacion, sector_x, sector_y, sector_batea) values (4, 'cultivo', 5, 'salida', 0, 0, 1);


insert into bateas (name, polygon, x_sector, y_sector) values ('Indemosa I', 'Arousa', 3, 2);
insert into bateas (name, polygon, x_sector, y_sector) values ('Luisa IV', 'Cambados', 4, 4);

select * from bateas;

select * from sectores where batea=6;