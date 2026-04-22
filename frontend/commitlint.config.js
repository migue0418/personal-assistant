export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // nueva funcionalidad
        'fix', // corrección de bug
        'chore', // tareas de mantenimiento (deps, config)
        'refactor', // refactorización sin cambio de comportamiento
        'style', // cambios de formato/estilos CSS
        'test', // tests
        'docs', // documentación
        'perf', // mejoras de rendimiento
        'ci', // cambios en CI/CD
        'revert', // revert de commit anterior
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 200],
  },
}
