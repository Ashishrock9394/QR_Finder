<?php

namespace Database\Seeders;

use App\Models\CardTemplate;
use Illuminate\Database\Seeder;

class CardTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Noir Signature',
                'template_key' => 'elegant_dark',
                'description' => 'A refined charcoal card with a dedicated QR panel',
                'thumbnail' => 'templates/elegant_dark.jpg',
                'settings' => json_encode(['color' => '#171923', 'layout' => 'dark']),
                'html' => <<<'HTML'
<div style="display:flex;width:700px;height:401px;box-sizing:border-box;overflow:hidden;font-family:Arial,sans-serif;background:#171923;color:#f8fafc;">
    <div style="width:65%;box-sizing:border-box;padding:34px;display:flex;flex-direction:column;justify-content:center;">
        <div style="margin-bottom:18px;">{{company_logo}}</div>
        <div style="font-size:30px;line-height:1.15;font-weight:700;letter-spacing:-.5px;">{{name}}</div>
        <div style="font-size:13px;color:#aeb7c6;margin-top:7px;margin-bottom:22px;">{{designation}}</div>
        <div style="height:2px;width:38px;background:#42d6c4;margin-bottom:14px;"></div>
        <div style="font-size:11px;line-height:1.9;color:#d9dfeb;">
            <div>{{mobile}}</div><div>{{email}}</div><div>{{website}}</div><div>{{address}}</div>
        </div>
    </div>
    <div style="width:35%;box-sizing:border-box;background:#222735;border-left:1px solid #343b4c;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;text-align:center;">
        <div style="font-size:14px;line-height:1.4;font-weight:700;color:#fff;margin-bottom:18px;">{{company_name}}</div>
        <div style="padding:10px;background:#fff;border-radius:12px;line-height:0;">{{qr_image}}</div>
        <div style="font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:#aeb7c6;margin-top:12px;">Scan to connect</div>
    </div>
</div>
HTML,
            ],
            [
                'name' => 'Aurum Luxe',
                'template_key' => 'luxury_gold',
                'description' => 'Warm ivory and gold styling with an elegant QR seal',
                'thumbnail' => 'templates/luxury_gold.jpg',
                'settings' => json_encode(['color' => '#b28a45', 'layout' => 'luxury']),
                'html' => <<<'HTML'
<div style="display:flex;width:700px;height:401px;box-sizing:border-box;overflow:hidden;font-family:Georgia,serif;background:#f7f3e9;color:#302a20;border:1px solid #e3d7bd;">
    <div style="width:68%;box-sizing:border-box;padding:34px;display:flex;flex-direction:column;justify-content:center;">
        <div style="margin-bottom:17px;">{{company_logo}}</div>
        <div style="font-size:30px;line-height:1.15;font-weight:700;color:#302a20;">{{name}}</div>
        <div style="font-size:13px;color:#8a7046;margin-top:7px;margin-bottom:20px;">{{designation}}</div>
        <div style="font-size:14px;font-weight:700;color:#8a6b36;margin-bottom:12px;">{{company_name}}</div>
        <div style="height:1px;background:#d9c9a8;margin-bottom:13px;"></div>
        <div style="font-size:11px;line-height:1.8;color:#625a4c;">
            <div>{{email}}</div><div>{{mobile}}</div><div>{{website}}</div><div>{{address}}</div>
        </div>
    </div>
    <div style="width:32%;box-sizing:border-box;background:#eee5d2;border-left:1px solid #e0d2b7;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:17px;text-align:center;">
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8a7046;margin-bottom:14px;">Digital card</div>
        <div style="padding:10px;background:#fff;border:1px solid #e0d2b7;border-radius:50%;line-height:0;">{{qr_image}}</div>
        <div style="font-size:10px;line-height:1.4;color:#625a4c;margin-top:14px;">{{company_name}}</div>
    </div>
</div>
HTML,
            ],
            [
                'name' => 'Tide Studio',
                'template_key' => 'modern_split',
                'description' => 'Fresh teal brand panel paired with crisp contact details',
                'thumbnail' => 'templates/modern_split.jpg',
                'settings' => json_encode(['color' => '#087f78', 'layout' => 'split']),
                'html' => <<<'HTML'
<div style="display:flex;width:700px;height:401px;box-sizing:border-box;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;background:#fff;">
    <div style="width:39%;box-sizing:border-box;background:#087f78;color:#fff;padding:25px;display:flex;flex-direction:column;justify-content:space-between;">
        <div><div style="margin-bottom:13px;">{{company_logo}}</div><div style="font-size:14px;line-height:1.4;font-weight:700;">{{company_name}}</div></div>
        <div style="align-self:flex-start;padding:8px;background:#fff;border-radius:10px;line-height:0;">{{qr_image}}</div>
        <div style="font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:#d1faf3;">Scan to connect</div>
    </div>
    <div style="width:61%;box-sizing:border-box;padding:30px;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:28px;line-height:1.15;font-weight:700;color:#123b3a;">{{name}}</div>
        <div style="font-size:13px;color:#087f78;margin-top:7px;margin-bottom:21px;">{{designation}}</div>
        <div style="height:3px;width:38px;background:#f1a75b;margin-bottom:15px;"></div>
        <div style="font-size:11px;line-height:1.9;color:#4b6261;">
            <div>{{mobile}}</div><div>{{email}}</div><div>{{website}}</div><div>{{address}}</div>
        </div>
    </div>
</div>
HTML,
            ],
            [
                'name' => 'Signature Minimal',
                'template_key' => 'modern_minimal',
                'description' => 'A polished white-and-navy card with a bold QR feature',
                'thumbnail' => 'templates/modern_minimal.jpg',
                'settings' => json_encode(['color' => '#17324d', 'layout' => 'minimal']),
                'html' => <<<'HTML'
<div style="display:flex;flex-direction:column;width:700px;height:401px;box-sizing:border-box;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;background:#fff;">
    <div style="width:100%;height:108px;box-sizing:border-box;padding:18px 30px;background:#17324d;color:#fff;display:flex;align-items:center;justify-content:space-between;border-bottom:5px solid #21b6a8;flex-shrink:0;">
        <div style="max-width:45%;max-height:76px;overflow:hidden;">{{company_logo}}</div>
        <div style="max-width:48%;font-size:17px;line-height:1.3;font-weight:700;text-align:right;">{{company_name}}</div>
    </div>
    <div style="width:100%;height:293px;display:flex;box-sizing:border-box;flex-shrink:0;">
        <div style="width:68%;box-sizing:border-box;padding:24px 30px;display:flex;flex-direction:column;justify-content:center;">
            <div style="font-size:30px;line-height:1.12;font-weight:700;letter-spacing:-.5px;color:#17324d;">{{name}}</div>
            <div style="font-size:13px;color:#12877f;margin-top:7px;margin-bottom:17px;font-weight:600;">{{designation}}</div>
            <div style="height:2px;width:38px;background:#21b6a8;margin-bottom:13px;"></div>
            <div style="font-size:11px;line-height:1.85;color:#536273;">
                <div>{{email}}</div><div>{{mobile}}</div><div>{{website}}</div><div>{{address}}</div>
            </div>
        </div>
        <div style="width:32%;box-sizing:border-box;background:#f0f7f6;border-left:1px solid #dce9e7;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:15px;text-align:center;">
            <div style="font-size:9px;line-height:1.4;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:#12877f;margin-bottom:12px;">Scan to connect</div>
            <div style="padding:8px;background:#fff;border:1px solid #dce9e7;border-radius:10px;line-height:0;">{{qr_image}}</div>
        </div>
    </div>
</div>
HTML,
            ],
            [
                'name' => 'Blue Crest',
                'template_key' => 'corporate_blue',
                'description' => 'Confident corporate blue with a clean QR side card',
                'thumbnail' => 'templates/corporate_blue.jpg',
                'settings' => json_encode(['color' => '#1559a6', 'layout' => 'corporate']),
                'html' => <<<'HTML'
<div style="display:flex;width:700px;height:401px;box-sizing:border-box;overflow:hidden;font-family:Arial,sans-serif;background:#fff;">
    <div style="width:100%;height:100%;box-sizing:border-box;border-top:9px solid #1559a6;display:flex;flex-direction:column;">
        <div style="height:88px;box-sizing:border-box;padding:14px 30px;background:#f1f6fc;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #d9e5f2;">
            <div style="max-width:42%;max-height:65px;overflow:hidden;">{{company_logo}}</div>
            <div style="max-width:50%;font-size:16px;line-height:1.3;font-weight:700;color:#174574;text-align:right;">{{company_name}}</div>
        </div>
        <div style="height:304px;display:flex;box-sizing:border-box;">
            <div style="width:68%;box-sizing:border-box;padding:23px 30px;display:flex;flex-direction:column;justify-content:center;">
                <div style="font-size:27px;line-height:1.15;font-weight:700;color:#17324d;">{{name}}</div>
                <div style="font-size:12px;color:#55718e;margin-top:6px;margin-bottom:16px;">{{designation}}</div>
                <div style="border-left:3px solid #1559a6;padding-left:12px;font-size:11px;line-height:1.85;color:#40546a;">
                    <div>{{mobile}}</div><div>{{email}}</div><div>{{website}}</div><div>{{address}}</div>
                </div>
            </div>
            <div style="width:32%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:13px;text-align:center;">
                <div style="padding:8px;border:1px solid #d9e5f2;border-radius:9px;line-height:0;">{{qr_image}}</div>
                <div style="font-size:9px;letter-spacing:1px;color:#55718e;margin-top:10px;">SCAN TO SAVE</div>
            </div>
        </div>
    </div>
</div>
HTML,
            ],
            [
                'name' => 'Citrus Pop',
                'template_key' => 'creative_gradient',
                'description' => 'Energetic coral and tangerine blocks with a bright QR frame',
                'thumbnail' => 'templates/creative_gradient.jpg',
                'settings' => json_encode(['color' => '#f2674a', 'layout' => 'creative']),
                'html' => <<<'HTML'
<div style="display:flex;width:700px;height:401px;box-sizing:border-box;overflow:hidden;font-family:'Trebuchet MS',Arial,sans-serif;background:#fff;">
    <div style="width:36%;box-sizing:border-box;background:linear-gradient(150deg,#f2674a 0%,#f59e45 100%);padding:24px;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
        <div style="margin-bottom:14px;">{{company_logo}}</div>
        <div style="font-size:13px;line-height:1.4;font-weight:700;margin-bottom:17px;">{{company_name}}</div>
        <div style="padding:9px;background:#fff;border-radius:12px;line-height:0;box-shadow:0 5px 18px rgba(100,40,20,.18);">{{qr_image}}</div>
        <div style="font-size:9px;letter-spacing:1.3px;text-transform:uppercase;margin-top:12px;color:#fff4df;">Scan me</div>
    </div>
    <div style="width:64%;box-sizing:border-box;padding:30px;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:28px;line-height:1.15;font-weight:700;color:#292d38;">{{name}}</div>
        <div style="font-size:12px;color:#e45d42;margin-top:7px;margin-bottom:18px;font-weight:700;">{{designation}}</div>
        <div style="height:3px;width:40px;background:#f59e45;margin-bottom:14px;"></div>
        <div style="font-size:11px;line-height:1.9;color:#555d6b;">
            <div>{{email}}</div><div>{{mobile}}</div><div>{{website}}</div><div>{{address}}</div>
        </div>
    </div>
</div>
HTML,
            ],
            [
                'name' => 'Sapphire Edge',
                'template_key' => 'sapphire_edge',
                'description' => 'Deep blue geometric styling with an electric accent',
                'thumbnail' => 'templates/sapphire_edge.jpg',
                'settings' => json_encode(['color' => '#173d7a', 'layout' => 'sapphire']),
                'html' => <<<'HTML'
<div style="display:flex;width:700px;height:401px;box-sizing:border-box;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;background:#f5f8ff;color:#132b50;">
    <div style="width:62%;box-sizing:border-box;padding:31px;display:flex;flex-direction:column;justify-content:center;border-left:9px solid #3478f6;">
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#3478f6;margin-bottom:15px;">{{company_name}}</div>
        <div style="margin-bottom:14px;">{{company_logo}}</div>
        <div style="font-size:29px;line-height:1.15;font-weight:700;">{{name}}</div>
        <div style="font-size:13px;color:#55708f;margin-top:6px;margin-bottom:18px;">{{designation}}</div>
        <div style="height:2px;width:42px;background:#3478f6;margin-bottom:13px;"></div>
        <div style="font-size:11px;line-height:1.85;color:#465a74;">
            <div>{{mobile}}</div><div>{{email}}</div><div>{{website}}</div><div>{{address}}</div>
        </div>
    </div>
    <div style="width:38%;box-sizing:border-box;background:#173d7a;border-left:5px solid #3478f6;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:22px;text-align:center;">
        <div style="font-size:10px;letter-spacing:1.3px;text-transform:uppercase;color:#d7e6ff;margin-bottom:14px;">Connect instantly</div>
        <div style="padding:9px;background:#fff;border-radius:11px;line-height:0;">{{qr_image}}</div>
        <div style="font-size:12px;font-weight:700;color:#fff;margin-top:14px;">{{company_name}}</div>
    </div>
</div>
HTML,
            ],
            [
                'name' => 'Paper & Brass',
                'template_key' => 'warm_ivory',
                'description' => 'Soft paper tones, serif typography and understated brass detail',
                'thumbnail' => 'templates/warm_ivory.jpg',
                'settings' => json_encode(['color' => '#9b7444', 'layout' => 'classic']),
                'html' => <<<'HTML'
<div style="display:flex;width:700px;height:401px;box-sizing:border-box;overflow:hidden;font-family:Georgia,serif;background:#faf7f0;border:1px solid #e5dccb;color:#37342e;">
    <div style="width:70%;box-sizing:border-box;padding:31px;display:flex;flex-direction:column;justify-content:center;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;">
            <div style="max-width:40%;max-height:62px;overflow:hidden;">{{company_logo}}</div>
            <div style="height:1px;flex:1;background:#c8ae83;"></div>
            <div style="max-width:48%;font-size:12px;line-height:1.4;color:#8a6b42;text-align:right;">{{company_name}}</div>
        </div>
        <div style="font-size:29px;line-height:1.15;font-weight:700;">{{name}}</div>
        <div style="font-size:13px;color:#94764e;margin-top:6px;margin-bottom:19px;">{{designation}}</div>
        <div style="font-size:11px;line-height:1.9;color:#69645a;">
            <div>{{email}}</div><div>{{mobile}}</div><div>{{website}}</div><div>{{address}}</div>
        </div>
    </div>
    <div style="width:30%;box-sizing:border-box;background:#f0e8d9;border-left:1px solid #e1d4bd;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;text-align:center;">
        <div style="padding:8px;background:#fff;border:1px solid #dfd0b5;border-radius:8px;line-height:0;">{{qr_image}}</div>
        <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#8a6b42;margin-top:11px;">Scan for details</div>
    </div>
</div>
HTML,
            ],
            [
                'name' => 'Evergreen Studio',
                'template_key' => 'forest_studio',
                'description' => 'Natural forest green with a bright, easy-to-scan QR card',
                'thumbnail' => 'templates/forest_studio.jpg',
                'settings' => json_encode(['color' => '#205c45', 'layout' => 'forest']),
                'html' => <<<'HTML'
<div style="display:flex;width:700px;height:401px;box-sizing:border-box;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;background:#eef3ec;color:#20352a;">
    <div style="width:35%;box-sizing:border-box;background:#205c45;padding:22px;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
        <div style="margin-bottom:13px;">{{company_logo}}</div>
        <div style="font-size:13px;line-height:1.4;font-weight:700;margin-bottom:16px;">{{company_name}}</div>
        <div style="padding:8px;background:#fff;border-radius:12px;line-height:0;">{{qr_image}}</div>
        <div style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#d8eee0;margin-top:11px;">Scan to connect</div>
    </div>
    <div style="width:65%;box-sizing:border-box;padding:30px;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:28px;line-height:1.15;font-weight:700;color:#20352a;">{{name}}</div>
        <div style="font-size:13px;color:#518167;margin-top:6px;margin-bottom:18px;">{{designation}}</div>
        <div style="height:2px;width:40px;background:#82a98b;margin-bottom:14px;"></div>
        <div style="font-size:11px;line-height:1.9;color:#53655a;">
            <div>{{mobile}}</div><div>{{email}}</div><div>{{website}}</div><div>{{address}}</div>
        </div>
    </div>
</div>
HTML,
            ],
            [
                'name' => 'Coral Atelier',
                'template_key' => 'coral_atelier',
                'description' => 'Contemporary coral, blush and ink with an offset QR feature',
                'thumbnail' => 'templates/coral_atelier.jpg',
                'settings' => json_encode(['color' => '#d95757', 'layout' => 'coral']),
                'html' => <<<'HTML'
<div style="display:flex;width:700px;height:401px;box-sizing:border-box;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;background:#fff8f6;color:#292d38;">
    <div style="width:65%;box-sizing:border-box;padding:30px;display:flex;flex-direction:column;justify-content:center;">
        <div style="display:flex;align-items:center;gap:13px;margin-bottom:22px;">
            <div style="max-width:42%;max-height:64px;overflow:hidden;">{{company_logo}}</div>
            <div style="height:2px;flex:1;background:#eea4a0;"></div>
            <div style="max-width:45%;font-size:12px;font-weight:700;color:#b64d50;text-align:right;">{{company_name}}</div>
        </div>
        <div style="font-size:29px;line-height:1.15;font-weight:700;">{{name}}</div>
        <div style="font-size:13px;color:#c45c5e;margin-top:6px;margin-bottom:18px;">{{designation}}</div>
        <div style="font-size:11px;line-height:1.9;color:#62636b;">
            <div>{{email}}</div><div>{{mobile}}</div><div>{{website}}</div><div>{{address}}</div>
        </div>
    </div>
    <div style="width:35%;box-sizing:border-box;background:#d95757;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;text-align:center;">
        <div style="font-size:9px;letter-spacing:1.3px;text-transform:uppercase;color:#ffe9e4;margin-bottom:13px;">Meet me online</div>
        <div style="padding:9px;background:#fff;border-radius:16px;line-height:0;box-shadow:0 8px 20px rgba(80,25,25,.16);">{{qr_image}}</div>
        <div style="font-size:11px;line-height:1.4;font-weight:700;color:#fff;margin-top:13px;">{{name}}</div>
    </div>
</div>
HTML,
            ],
        ];

        foreach ($templates as $template) {
            CardTemplate::updateOrCreate(
                ['template_key' => $template['template_key']],
                $template
            );
        }
    }
}
