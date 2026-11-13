import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
if(process.platform!=='win32')throw Error('Instalador apenas para Windows.');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const quote=v=>"'"+v.replaceAll("'","''")+"'";
// Native Windows cmdlets; no ExecutionPolicy change, password, elevation or firewall changes.
const command=String.raw`
$ErrorActionPreference='Stop'
$pulsoRoot=${quote(root)}
$pulsoNode=${quote(process.execPath)}
$pulsoUser=[System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$pulsoName='PULSO-Local-'+[System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$pulsoAction=New-ScheduledTaskAction -Execute $pulsoNode -Argument ('"'+(Join-Path $pulsoRoot 'scripts\local-server.mjs')+'" --watch') -WorkingDirectory $pulsoRoot
$pulsoExisting=Get-ScheduledTask -TaskName $pulsoName -ErrorAction SilentlyContinue
if ($pulsoExisting -and ($pulsoExisting.Actions.Execute -ne $pulsoNode -or $pulsoExisting.Actions.Arguments -ne $pulsoAction.Arguments)) { throw 'Existe outra tarefa com o mesmo nome; nada foi substituido.' }
$pulsoTrigger=New-ScheduledTaskTrigger -AtLogOn -User $pulsoUser
$pulsoPrincipal=New-ScheduledTaskPrincipal -UserId $pulsoUser -LogonType Interactive -RunLevel Limited
$pulsoSettings=New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName $pulsoName -Action $pulsoAction -Trigger $pulsoTrigger -Principal $pulsoPrincipal -Settings $pulsoSettings -Description 'PULSO local em loopback. Recuperacao dos processos proprios.' -Force | Out-Null
$pulsoLink=Join-Path ([Environment]::GetFolderPath('Desktop')) 'PULSO.lnk'
$pulsoShell=New-Object -ComObject WScript.Shell
$pulsoShortcut=$pulsoShell.CreateShortcut($pulsoLink)
$pulsoTarget=Join-Path $pulsoRoot 'PULSO.cmd'
if ((Test-Path -LiteralPath $pulsoLink) -and $pulsoShortcut.TargetPath -ne $pulsoTarget) { throw 'Ja existe outro atalho PULSO; nao foi substituido.' }
$pulsoShortcut.TargetPath=$pulsoTarget
$pulsoShortcut.WorkingDirectory=$pulsoRoot
$pulsoShortcut.Description='Iniciar ou recuperar PULSO e abrir no browser'
$pulsoShortcut.WindowStyle=7
$pulsoShortcut.Save()
Start-ScheduledTask -TaskName $pulsoName
Write-Output 'Arranque no inicio de sessao e atalho PULSO configurados. Sem privilegios elevados.'
`;
const result=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',command],{stdio:'inherit',windowsHide:true});
process.exitCode=result.status??1;
