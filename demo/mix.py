"""מרכיב את הסרטון: הצילום, שורות הקריינות בזמני הסצנות, והמוזיקה ברקע.
הרצה: python3 demo/mix.py <תיקיית עבודה> <public>"""
import json, subprocess, sys, os
work, out = sys.argv[1], sys.argv[2]
m = json.load(open(f'{work}/marks.json'))
lead, total = m['lead'], m['total']
scenes = [x for x in m['marks'] if 'i' in x and os.path.exists(f"{work}/n{x['i']}.mp3")]
poster = next(x['poster'] for x in m['marks'] if 'poster' in x)
cmd = ['ffmpeg', '-v', 'error', '-y', '-ss', f'{lead:.3f}', '-t', f'{total:.3f}', '-i', f'{work}/raw.webm']
for s in scenes: cmd += ['-i', f"{work}/n{s['i']}.mp3"]
cmd += ['-i', f'{work}/bossa.mp3']
parts = [f"[{k + 1}:a]adelay={int((s['at'] + 0.25) * 1000)}:all=1,volume=1.6[v{k}]" for k, s in enumerate(scenes)]
voice = ''.join(f'[v{k}]' for k in range(len(scenes)))
music = len(scenes) + 1
graph = ';'.join(parts) + f";{voice}amix=inputs={len(scenes)}:normalize=0,apad=whole_dur={total:.3f}[voice]" \
    + f";[{music}:a]atrim=0:{total:.3f},volume=0.5,afade=t=in:d=1.2,afade=t=out:st={total - 2.5:.3f}:d=2.5[bed]" \
    + ";[voice]asplit=2[vo][key];[bed][key]sidechaincompress=threshold=0.02:ratio=9:attack=60:release=700[duck]" \
    + ";[vo][duck]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]"
cmd += ['-filter_complex', graph, '-map', '0:v', '-map', '[a]', '-r', '25', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-t', f'{total:.3f}', f'{out}/demo.mp4']
subprocess.run(cmd, check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{poster:.2f}', '-i', f'{out}/demo.mp4', '-frames:v', '1', '-q:v', '4', f'{out}/demo-poster.jpg'], check=True)
