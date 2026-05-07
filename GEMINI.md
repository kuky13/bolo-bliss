# Doce Vitrine

## Identidade e Branding
- O projeto foi renomeado de "Bolo Biz" para **Doce Vitrine**.
- Toda a comunicação visual e textual deve refletir este novo nome.

## Convenções Técnicas

### Supabase (PostgREST)
- **Consultas de registro único:** Utilize sempre `.maybeSingle()` em vez de `.single()`. 
- **Motivo:** O método `.single()` gera erros de rede (406 Not Acceptable) quando nenhum registro é encontrado, o que polui os logs e pode causar inconsistências no estado da aplicação. O `.maybeSingle()` retorna `null` graciosamente nestes casos.

### Manipulação de DOM
- Ao utilizar métodos como `getBoundingClientRect()`, sempre verifique se o elemento alvo (`Element` ou `HTMLElement`) não é nulo/undefined antes de realizar a chamada, especialmente em animações ou componentes que dependem de renderização assíncrona.
