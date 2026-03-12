import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { emailConfig } from "src/config";
import { EmailService } from "./application/services";
import { EmailTemplateService } from "./application/services";

@Global()
@Module({
    imports: [ConfigModule.forFeature(emailConfig)],
    providers: [EmailService, EmailTemplateService],
    exports: [EmailService, EmailTemplateService],
})
export class EmailModule {}