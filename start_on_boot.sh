#!/bin/zsh
# Load NVM and other environment variables
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
source ~/.zshrc

# Start the application
cd /Users/mac/tools/tpglass
npm start
