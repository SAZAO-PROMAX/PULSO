"""Private local operator tool for fictitious accounts; no e-mail delivery service."""
import argparse
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from services.api.app.accounts import issue_token

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--email',required=True)
    parser.add_argument('--purpose',required=True,choices=['reset','verify','email-change'])
    args=parser.parse_args();token=issue_token(args.email,args.purpose)
    if token:
        print('Código de desenvolvimento: utilização única, válido por 15 minutos. Não guardar em relatórios ou Git.')
        print(token)
    else:print('Não existe uma ação disponível para este pedido de desenvolvimento.')

if __name__=='__main__':main()
