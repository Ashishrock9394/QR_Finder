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
                'name' => 'Modern Minimal',
                'template_key' => 'modern_minimal',
                'description' => 'Clean and minimal design with left sidebar',
                'thumbnail' => 'templates/modern_minimal.jpg',
                'settings' => json_encode(['color' => '#1a73e8', 'layout' => 'minimal']),
                'html' => <<<'HTML'
<div style="display: flex; height: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="width: 35%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; display: flex; flex-direction: column; justify-content: center;">
        <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">{{name}}</div>
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 20px;">{{designation}}</div>
        <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 15px; font-size: 12px;">
            <div style="margin-bottom: 8px;">📧 {{email}}</div>
            <div style="margin-bottom: 8px;">📱 {{mobile}}</div>
            <div style="margin-bottom: 8px;">🌐 {{website}}</div>
            <div>📍 {{address}}</div>
        </div>
    </div>
    <div style="width: 65%; padding: 30px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
            <div style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px;">{{company_name}}</div>
            <div style="height: 2px; width: 50px; background: #667eea; margin-bottom: 20px;"></div>
            <p style="color: #666; font-size: 12px; line-height: 1.6;">Premium visiting card with modern design and professional touch.</p>
        </div>
        <div style="text-align: right;">
            {{qr_image}}
        </div>
    </div>
</div>
HTML,
            ],
            [
                'name' => 'Corporate Blue',
                'template_key' => 'corporate_blue',
                'description' => 'Professional corporate design with blue accent',
                'thumbnail' => 'templates/corporate_blue.jpg',
                'settings' => json_encode(['color' => '#003d82', 'layout' => 'corporate']),
                'html' => <<<'HTML'
<div style="display: flex; height: 100%; font-family: Arial, sans-serif; background: white;">
    <div style="width: 100%; padding: 25px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
                <div style="font-size: 28px; font-weight: bold; color: #003d82; margin-bottom: 5px;">{{name}}</div>
                <div style="font-size: 13px; color: #666; margin-bottom: 15px; font-weight: 500;">{{designation}}</div>
                <div style="font-size: 11px; color: #003d82; font-weight: bold; margin-bottom: 12px;">{{company_name}}</div>
                
                <div style="border-left: 3px solid #003d82; padding-left: 12px; font-size: 11px; color: #333; line-height: 1.8;">
                    <div>✉ {{email}}</div>
                    <div>☎ {{mobile}}</div>
                    <div>🔗 {{website}}</div>
                    <div>📮 {{address}}</div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 5px;">
                {{qr_image}}
            </div>
        </div>
        
        <div style="border-top: 2px solid #003d82; margin-top: 18px; padding-top: 12px; font-size: 9px; color: #999;">
            Professional & Reliable
        </div>
    </div>
</div>
HTML,
            ],
            [
                'name' => 'Creative Gradient',
                'template_key' => 'creative_gradient',
                'description' => 'Vibrant design with gradient background',
                'thumbnail' => 'templates/creative_gradient.jpg',
                'settings' => json_encode(['color' => '#ff6b6b', 'layout' => 'creative']),
                'html' => <<<'HTML'
<div style="display: flex; height: 100%; font-family: 'Trebuchet MS', sans-serif; background: linear-gradient(90deg, #ff6b6b 0%, #ffa94d 100%);">
    <div style="width: 40%; padding: 25px; color: white; display: flex; flex-direction: column; justify-content: center;">
        {{qr_image}}
    </div>
    
    <div style="width: 60%; padding: 30px; background: white; display: flex; flex-direction: column; justify-content: center;">
        <div style="font-size: 26px; font-weight: bold; color: #333; margin-bottom: 3px;">{{name}}</div>
        <div style="font-size: 12px; color: #ff6b6b; margin-bottom: 15px; font-weight: bold;">{{designation}} @ {{company_name}}</div>
        
        <div style="font-size: 11px; color: #555; line-height: 1.8;">
            <div style="margin-bottom: 6px;"><strong>Email:</strong> {{email}}</div>
            <div style="margin-bottom: 6px;"><strong>Phone:</strong> {{mobile}}</div>
            <div style="margin-bottom: 6px;"><strong>Website:</strong> {{website}}</div>
            <div><strong>Address:</strong> {{address}}</div>
        </div>
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
