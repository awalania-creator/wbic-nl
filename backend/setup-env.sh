#!/bin/bash

###############################################################################
# WBIC Backend Environment Setup Script
# Purpose: Create and configure .env file for WBIC backend
# Usage: bash setup-env.sh
###############################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ${NC}  $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

###############################################################################
# Main Setup
###############################################################################

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   WBIC Backend Environment Setup                          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found"
    log_info "Please run this script from the backend/ directory"
    exit 1
fi

log_success "Running in backend directory"
echo ""

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    log_error ".env.example not found"
    log_info "This script requires .env.example as a template"
    exit 1
fi

log_success ".env.example found"
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    log_warning ".env file already exists"
    echo ""
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Keeping existing .env file"
        echo ""
        log_info "To view current configuration:"
        echo "    cat .env"
        exit 0
    fi
fi

# Create .env from template
log_info "Creating .env from .env.example..."
cp .env.example .env
log_success ".env created"
echo ""

###############################################################################
# Interactive Configuration
###############################################################################

echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Configuration${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

# Ask for Turnstile Secret
log_info "Cloudflare Turnstile Secret"
echo -e "${YELLOW}Where to find it:${NC}"
echo "  1. Go to https://dash.cloudflare.com/"
echo "  2. Log in to your account"
echo "  3. Navigate to Settings > API Tokens"
echo "  4. Look for Turnstile section"
echo "  5. Create/view your Secret Key"
echo ""

read -p "Enter your Cloudflare Turnstile Secret Key: " TURNSTILE_SECRET

if [ -z "$TURNSTILE_SECRET" ]; then
    log_error "Turnstile secret cannot be empty"
    rm .env
    log_info "Setup cancelled. Please try again with a valid secret."
    exit 1
fi

# Update .env with Turnstile secret
sed -i "s|CLOUDFLARE_TURNSTILE_SECRET=.*|CLOUDFLARE_TURNSTILE_SECRET=$TURNSTILE_SECRET|g" .env
log_success "Turnstile secret configured"
echo ""

# Ask for SMTP configuration
log_info "Email Configuration (SMTP)"
echo "These settings are pre-configured for local Postfix."
echo ""

read -p "SMTP Host [localhost]: " SMTP_HOST
SMTP_HOST=${SMTP_HOST:-localhost}

read -p "SMTP Port [25]: " SMTP_PORT
SMTP_PORT=${SMTP_PORT:-25}

read -p "From Email Address [info@wbic.nl]: " SMTP_FROM
SMTP_FROM=${SMTP_FROM:-info@wbic.nl}

read -p "To Email Address [info@wbic.nl]: " SMTP_TO
SMTP_TO=${SMTP_TO:-info@wbic.nl}

# Update .env with SMTP settings
sed -i "s|^SMTP_HOST=.*|SMTP_HOST=$SMTP_HOST|g" .env
sed -i "s|^SMTP_PORT=.*|SMTP_PORT=$SMTP_PORT|g" .env
sed -i "s|^SMTP_FROM=.*|SMTP_FROM=$SMTP_FROM|g" .env
sed -i "s|^SMTP_TO=.*|SMTP_TO=$SMTP_TO|g" .env

log_success "SMTP configured"
echo ""

###############################################################################
# Summary and Verification
###############################################################################

echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Configuration Summary${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

echo "Your .env file has been configured with:"
echo ""
echo -e "${YELLOW}SMTP Configuration:${NC}"
echo "  Host: $SMTP_HOST"
echo "  Port: $SMTP_PORT"
echo "  From: $SMTP_FROM"
echo "  To:   $SMTP_TO"
echo ""
echo -e "${YELLOW}Turnstile CAPTCHA:${NC}"
echo "  Secret: ***${TURNSTILE_SECRET: -4}"
echo ""

# Verify .env file
if grep -q "CLOUDFLARE_TURNSTILE_SECRET=$TURNSTILE_SECRET" .env; then
    log_success "Configuration verified"
else
    log_error "Configuration verification failed"
    exit 1
fi

echo ""

###############################################################################
# Next Steps
###############################################################################

echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Next Steps${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

echo "Your environment is now configured! To deploy:"
echo ""
echo "  1. Return to project root:"
echo "     cd .."
echo ""
echo "  2. Run the deployment script:"
echo "     bash deploy.sh"
echo ""
echo "  3. View logs if needed:"
echo "     docker-compose logs -f wbic-backend"
echo ""
echo "To modify configuration later:"
echo "  nano .env"
echo ""
echo -e "${GREEN}✨ Setup complete! ✨${NC}"
echo ""
