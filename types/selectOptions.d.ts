interface where {
  main?: pair,
  ands?: pair[]
}

interface limit {
  start?: number
  end?: number
}
declare interface selectOptions {
  where?: where,
  limit?: limit
}