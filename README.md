# Sistema de reporte y análisis de ventas de Sándwiches Otto

Este proyecto es una aplicación web utilizada por el emprendimiento Sándwiches Otto dentro de la Universidad del Magdalena para llevar un registro de las ventas realizadas, generar reportes y análizar estadísticas del negocio.

Este repositorio es una copia del repositorio en el cual se encontraba alojada la primera versión de la aplicación. El objetivo de este nuevo repositorio es mejorar significativamente la calidad del proyecto original y manejar una trazabilidad más controlada.

El stack tecnológico sobre el cual fue construido se compone de React, TailwindCSS y Supabase.

## Cómo colaborar

### Roles

| Rol | Responsabilidad |
|-----|----------------|
| **Maintainer** | Administra el repositorio, revisa y aprueba PRs, gestiona tags y releases, configura reglas de protección de ramas. |
| **Collaborator** | Desarrolla funcionalidades en ramas `feature/*`, abre PRs hacia `develop` y atiende revisiones. |

### Configuración inicial (solo el Maintainer)

1. **Crear el repositorio** en GitHub como **privado** y agregar a los colaboradores en *Settings > Collaborators*.
2. **Proteger las ramas `main` y `develop`** en *Settings > Branches > Branch protection rules*:
   - Requerir Pull Request antes de mergear.
   - Requerir al menos una aprobación.
   - Requerir que las ramas estén actualizadas.
   - Restringir push directo solo al Maintainer (opcional).
3. **Clonar el repositorio y crear `develop`**:
   ```bash
   git clone https://github.com/empresa/otto.git
   cd otto
   git checkout -b develop
   git push origin develop
   ```

### Modelo de branching (Git Flow)

Se utiliza el modelo **Git Flow** con las siguientes ramas:

| Rama | Propósito |
|------|-----------|
| `main` | Código listo para producción. Solo recibe merges de `release/*` o `hotfix/*`. |
| `develop` | Rama de integración para la próxima versión. Recibe merges de `feature/*`. |
| `feature/*` | Nacen de `develop`. Se usan para desarrollar una funcionalidad nueva. Ej: `feature/login`. Una vez terminada, se abre un Pull Request hacia `develop`. |
| `release/*` | Nacen de `develop`. Se crean cuando se va a preparar una nueva versión. Se abre PR hacia `main` y también se mergea de vuelta a `develop`. |
| `hotfix/*` | Nacen de `main`. Se usan para corregir errores críticos en producción. Se mergean a `main` (con nuevo tag) y también a `develop`. |

**Reglas importantes:**
- Las únicas ramas que siempre deben existir son `main` y `develop`.
- Las ramas `feature/*`, `release/*` y `hotfix/*` deben eliminarse después de que el PR sea fusionado.
- No está permitido hacer push directo a `main` ni a `develop`; todo entra mediante Pull Requests.

### Convenciones de código

- Los nombres de archivos, componentes, variables y funciones deben escribirse en **inglés** para mantener la consistencia con el resto del proyecto.
- La documentación y el texto con fines informativos (como comentarios en el código) deben escribirse en **español**.

### Convención de commits

Los mensajes de commit deben seguir el formato **Conventional Commits**:

```
tipo(alcance opcional): descripción corta en imperativo
```

**Tipos permitidos:**

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad visible para el usuario |
| `fix` | Corrección de un bug |
| `docs` | Cambios en documentación |
| `refactor` | Cambio interno que no altera comportamiento |
| `test` | Agregado o ajuste de tests |
| `chore` | Tareas de mantenimiento (deps, build, CI, versionado) |

**Reglas:**
- La primera línea comienza en minúscula.
- Después de los dos puntos (`:`) se inicia en minúscula.
- Sin punto final al final de la línea.
- Referenciar issues con `#`.
- Los cambios drásticos se indican con `BREAKING CHANGE:` en el footer.
- El commit de merge en `main` se etiqueta como `chore(release): vX.Y.Z`.

### Pull Requests

- Deben ser pequeños y enfocados (idealmente menos de 400 líneas).
- Deben incluir una descripción obligatoria con: contexto/problema, cambios principales, cómo probarlo, screenshots (si aplica) y el issue asociado.
- Deben contar con la aprobación de al menos un reviewer (otro Collaborator o el Maintainer).
- El autor debe asegurarse de que no haya conflictos con la rama destino.
- Serán rechazados si: no compilan, no siguen la convención de commits/branching, o tienen demasiados conflictos.
- No está permitido auto-aprobarse el PR.

### Flujo de trabajo diario (Collaborator)

1. Sinroniza tu rama `develop` local con el remoto:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Crea una rama `feature/<nombre>` desde `develop`:
   ```bash
   git checkout -b feature/<nombre>
   ```
3. Trabaja y realiza commits siguiendo la convención.
4. Sube tus cambios directamente al repositorio:
   ```bash
   git push origin feature/<nombre>
   ```
5. Abre un Pull Request desde `feature/<nombre>` hacia `develop` del repositorio principal.
6. Atiende las revisiones solicitadas por el Maintainer.
7. Una vez aprobado y fusionado, borra la rama remota y local:
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/<nombre>
   git push origin --delete feature/<nombre>
   ```

### Tags y releases

La gestión de tags y releases es responsabilidad exclusiva del **Maintainer** (Project Manager). Está prohibido crear tags de forma local. Se utiliza **SemVer estricto**:

```
vMAJOR.MINOR.PATCH
```

- `MAJOR`: versión incompatible con anteriores.
- `MINOR`: nueva funcionalidad compatible.
- `PATCH`: corrección compatible.

Para pre-releases se añade `-rc.VERSION` o `-alpha.VERSION`.


