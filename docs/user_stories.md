## Historia de usuario 1

**Título:** como administrador o empleado del emprendimiento Sándwiches Otto quiero ser capaz de registrar las ventas del día para llevar trazabilidad de las mismas.

**Descripción:** el administrador o empleado del emprendimiento Sándwiches Otto deben ser capaces de registrar los datos de las ventas hechas en el día. Estos datos son: producto vendido (sándwich, bebida o adicional), precio total, precio con descuento (en caso de que aplique), cantidad pagada en transferencia y cantidad pagada en efectivo. 

#### Criterios de aceptación

- Se pueden registrar los productos por venta (sándwich/es, bebida/s, adicional/es).
- Se puede registrar la cantidad pagada por el cliente en efectivo.
- Se puede registrar la cantidad pagada por el cliente en transferencia.
- Se puede registrar descuento aplicado en una venta.

## Historia de usuario 2

**Título:** como administrador o empleado del emprendimiento Sándwiches Otto quiero ser capaz de visualizar un historial con las ventas que llevo en el día para realizar contabilidad y detectar ventas registradas de forma errónea de manera inmediata.

**Descripción:** el administrador o empleado del emprendimiento de Sándwiches Otto deben poder visualizar un historial con las ventas realizadas en el día. Este historial debe mostrar todos los datos registrados por venta como: cantidad pagada en efectivo, cantidad pagada por transferencia, cantidad pagada en total y producto comprado. Además el historial debe ser editable, permitiendo modificar la información de cualquier venta registrada en el día.

#### Criterios de aceptación

- Cada venta registrada en el día es visualizable.
- Cada venta registrada en el día es editable o eliminable.
- El historial muestra solo las ventas del mismo día.
- El historial está vacío al iniciar cada día.
- La información de cada venta en el historial debe ser completa (tener todos los datos).

## Historia de usuario 3

**Título:** como administrador del emprendimiento Sándwiches Otto quiero ser capaz de visualizar todas las ventas que he registrado en el sistema.

**Descripción:** el administrador necesita un historial con todas las ventas registradas hasta el momento. El historial debe ser fácilmente manipulable y tiene que incluir: filtrado por fechas, precio, tipo de producto, etc.

#### Criterios de aceptación

- El historial de todas las ventas registradas es visualizable solo por el administrador.
- El historial de todas las ventas registradas permite filtrado por fechas, productos, montos 
- El historial es editable, permitiendo modificar ventas o eliminarlas.

## Historia de usuario 4

**Título:** como administrador del emprendimiento Sándwiches Otto quiero ser capaz de visualizar estadísticas de mis ventas generales.

**Descripción:** el administrador desea poder ver estadísticas de interés a partir del historial de ventas general. Estas estadísticas incluyen: producto más vendido, producto menos vendido, días con mayor cantidad de ventas, días con menor cantidad de ventas, etc. 

#### Criterios de aceptación

- Las estadísticas son solo visualizables por el administrador.
- Hay gráficas que permiten analizar las estadísticas visualmente.
- Las estadísticas mostradas son de interés para el administrador.

## Historia de usuario 5

**Título:** como administrador o empleado del emprendimiento Sándwiches Otto quiero poder visualizar cuánto dinero llevo en Nequi y cuánto dinero llevo en efectivo según las ventas realizadas en el día para poder hacer contabilidad al finalizar el día.

**Descripción:** tanto el administrador como el empleado necesitan saber cuánto dinero han acumulado en Nequi y cuánto en efectivo dependiendo de las ventas realizadas en el día. El fin de esto es poder validar que efectivamente la cantidad de dinero acumulada concuerde con la registrada y trazar posibles errores de parte del empleado o del sistema.

#### Criterios de aceptación

- Se puede visualizar la cantidad de dinero acumulada en Nequi.
- Se puede visualizar la cantidad de dinero acumulada en efectivo.
- Estas cantidades corresponden únicamente a las ventas registradas en el día.

## Historia de usuario 6

**Título:** como administrador del emprendimiento Sándwiches Otto quiero ser capaz de exportar las ventas a Excel para realizar contabilidad utilizando dicho software.

**Descripción:** el administrador quiere exportar las ventas realizadas en el día o las ventas realizadas en otros días mediante los historiales. El archivo exportable tiene que contar con todos los datos registrados en el sistema.

#### Criterios de aceptación

- Solo el administrador tiene la capacidad de exportar a Excel.
- Los datos exportados son fieles copias de los datos registrados en el sistema (1:1).
- El administrador puede decidir si exportar las ventas de un día en específico, de varios días o de todas las ventas registradas hasta el momento utilizando el historial de ventas histórico.
- El administrador puede exportar las ventas registradas en el día utilizando el historial de ventas del día.