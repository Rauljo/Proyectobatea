CREATE DATABASE bateas;

drop table movimientos;
drop table sectores;
drop table bateas;

CREATE TABLE bateas(
	id SERIAL primary key,
	name varchar(25),
	polygon varchar(25),
	row_sector int,
	col_sector int
);

CREATE TABLE sectores(
	row int,
	col int,
	batea int,
	cuerdas_pesca int default 0,
	cuerdas_piedra int default 0,
	cuerdas_desdoble int default 0,
	cuerdas_comercial int default 0,
	primary key (row,col,batea),
	foreign key(batea) references bateas(id)
);

create table movimientos (
	id serial primary key,
	tipo_cuerda varchar(10) check (tipo_cuerda in ('pesca', 'piedra', 'desdoble', 'comercial')),
	cantidad int,
	operacion varchar(10) check (operacion in ('entrada', 'salida')),
	sector_row int,
	sector_col int,
	sector_batea int,
	fecha timestamp default current_timestamp,
    fecha_previa timestamp default null,
    nota varchar(255) default '',
    vigente bool default null,
    vigencia interval default null,
	foreign key(sector_row, sector_col, sector_batea) references sectores(row,col,batea)
);

CREATE OR REPLACE FUNCTION establecer_vigencia() RETURNS TRIGGER AS $$
begin
    if (new.operacion = 'entrada') then
        new.vigente = true;
    end if;
    return new;
end;
$$ LANGUAGE plpgsql;

CREATE TRIGGER establecer_vigencia_trigger
before insert on movimientos
for each row
execute function establecer_vigencia();

create or replace function verificar_movimiento() returns trigger as $$
begin
    if (new.operacion = 'salida') then
        -- Verificar que la cantidad de salida no exceda la cantidad actual
        if (new.tipo_cuerda = 'pesca') then
            if (new.cantidad > (select cuerdas_pesca from sectores where row = new.sector_row and col = new.sector_col and batea = new.sector_batea)) then
                raise exception 'No hay suficientes cuerdas de pesca en el sector (%,%) de batea %', new.sector_row+1, new.sector_col+1, new.sector_batea;
            end if;
        elsif (new.tipo_cuerda = 'piedra') then
            if (new.cantidad > (select cuerdas_piedra from sectores where row = new.sector_row and col = new.sector_col and batea = new.sector_batea)) then
                raise exception 'No hay suficientes cuerdas de piedra en el sector (%,%) de batea %', new.sector_row+1, new.sector_col+1, new.sector_batea;
            end if;
        elsif (new.tipo_cuerda = 'desdoble') then
            if (new.cantidad > (select cuerdas_desdoble from sectores where row = new.sector_row and col = new.sector_col and batea = new.sector_batea)) then
                raise exception 'No hay suficientes cuerdas de desdoble en el sector (%,%) de batea %', new.sector_row+1, new.sector_col+1, new.sector_batea;
            end if;
        elsif (new.tipo_cuerda = 'comercial') then
            if (new.cantidad > (select cuerdas_comercial from sectores where row = new.sector_row and col = new.sector_col and batea = new.sector_batea)) then
                raise exception 'No hay suficientes cuerdas comerciales en el sector (%,%) de batea %', new.sector_row+1, new.sector_col+1, new.sector_batea;
            end if;
        end if;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger verificar_movimiento_trigger
before insert on movimientos
for each row
execute function verificar_movimiento();

create or replace function actualizar_cuerdas(new_mov movimientos) returns integer as $$
declare
    nuevo_valor INTEGER;
begin
    if new_mov.operacion = 'entrada' then
        if new_mov.tipo_cuerda = 'pesca' then
            update sectores set cuerdas_pesca = cuerdas_pesca + new_mov.cantidad
            where row = new_mov.sector_row and col = new_mov.sector_col and batea = new_mov.sector_batea
            returning cuerdas_pesca into nuevo_valor;
        elsif new_mov.tipo_cuerda = 'piedra' then
            update sectores set cuerdas_piedra = cuerdas_piedra + new_mov.cantidad
            where row = new_mov.sector_row and col = new_mov.sector_col and batea = new_mov.sector_batea
            returning cuerdas_piedra into nuevo_valor;
        elsif new_mov.tipo_cuerda = 'desdoble' then
            update sectores set cuerdas_desdoble = cuerdas_desdoble + new_mov.cantidad
            where row = new_mov.sector_row and col = new_mov.sector_col and batea = new_mov.sector_batea
            returning cuerdas_desdoble into nuevo_valor;
        elsif new_mov.tipo_cuerda = 'comercial' then
            update sectores set cuerdas_comercial = cuerdas_comercial + new_mov.cantidad
            where row = new_mov.sector_row and col = new_mov.sector_col and batea = new_mov.sector_batea
            returning cuerdas_comercial into nuevo_valor;
        end if;

    elsif new_mov.operacion = 'salida' then
        if new_mov.tipo_cuerda = 'pesca' then
            update sectores set cuerdas_pesca = cuerdas_pesca - new_mov.cantidad
            where row = new_mov.sector_row and col = new_mov.sector_col and batea = new_mov.sector_batea
            returning cuerdas_pesca into nuevo_valor;
        elsif new_mov.tipo_cuerda = 'piedra' then
            update sectores set cuerdas_piedra = cuerdas_piedra - new_mov.cantidad
            where row = new_mov.sector_row and col = new_mov.sector_col and batea = new_mov.sector_batea
            returning cuerdas_piedra into nuevo_valor;
        elsif new_mov.tipo_cuerda = 'desdoble' then
            update sectores set cuerdas_desdoble = cuerdas_desdoble - new_mov.cantidad
            where row = new_mov.sector_row and col = new_mov.sector_col and batea = new_mov.sector_batea
            returning cuerdas_desdoble into nuevo_valor;
        elsif new_mov.tipo_cuerda = 'comercial' then
            update sectores set cuerdas_comercial = cuerdas_comercial - new_mov.cantidad
            where row = new_mov.sector_row and col = new_mov.sector_col and batea = new_mov.sector_batea
            returning cuerdas_comercial into nuevo_valor;
        end if;
    end if;
        

    return nuevo_valor;
end;
$$ language plpgsql;



create or replace function actualizar_vigencia(new_mov movimientos, nuevo_valor integer) returns void as $$
declare
    entrada RECORD;
begin
    

    for entrada in 
        select *
        from movimientos m
        where m.vigente = true and m.sector_row = new_mov.sector_row and m.sector_col = new_mov.sector_col and m.sector_batea = new_mov.sector_batea and m.tipo_cuerda = new_mov.tipo_cuerda
        order by fecha desc, id desc
    loop

        

        -- Restamos a la cantidad actual lo que aporto ese movimiento
        nuevo_valor := nuevo_valor - entrada.cantidad;

        -- Si lo que aporto ese movimiento es 0 o menos, entonces ya no estara vigente
        if nuevo_valor <= 0 and -nuevo_valor >= entrada.cantidad then
            update movimientos
            set vigente = FALSE,
                vigencia = (now() - COALESCE(fecha_previa, fecha)),
                nota = 'Retirado ' || current_date || ' mov ' || new_mov.id
            where id = entrada.id and tipo_cuerda = entrada.tipo_cuerda;
        end if;

    end loop;
end;
$$ language plpgsql;


create or replace function trigger_post_insert_movimientos() returns trigger as $$
declare
    nuevo_valor INTEGER;
begin
    -- 1. Actualizar cuerdas y recoger el nuevo valor
    nuevo_valor := actualizar_cuerdas(NEW);

    --2. Si es una salida, recalcular vigencia
    if new.operacion = 'salida' then
        perform actualizar_vigencia(new, nuevo_valor);
    end if;

    return new;
end;
$$ language plpgsql;

create trigger trigger_post_insert_movimientos
after insert on movimientos
for each row
execute function trigger_post_insert_movimientos();
    

		