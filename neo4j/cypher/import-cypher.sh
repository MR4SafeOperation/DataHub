#!/bin/bash

# divide the $NEO4J_AUTH containing "user/pass" into two variables
# (thanks ChatGPT!)
password="${NEO4J_AUTH#*/}"
username="${NEO4J_AUTH%%/*}"

echo "Importing .cypher files placed in ./neo4j/cypher directory ..."
# Get the directory of this script
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

find "$script_dir" -type f -name "*.cypher" -print0 | while IFS= read -r -d '' file; do
    echo "- Importing: $file"
    cat $file | cypher-shell -u $username -p $password
done

echo Done.
