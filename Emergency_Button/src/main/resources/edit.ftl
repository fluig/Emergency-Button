<div id="emergencyButton_${instanceId}" 
	class="super-widget wcm-widget-class fluig-style-guide edit" 
	data-params="emergencyButton.instance({'editMode': true})">
	
	<fieldset>
		<legend>${i18n.getTranslation('edit.html.fieldset.legend')}</legend>
	
		<!-- alvo -->
		<div class="form-group">
			<label for="usuarios-alvo">${i18n.getTranslation('edit.html.field.alvo.legend')}</label>
			<input type="text" id="usuarios-alvo" name="usuarios-alvo" class="form-control" value="${usuariosAlvo!}" />
		</div>
		
		<!-- administradores -->		
		<div class="form-group">
			<label for="usuarios-administradores">${i18n.getTranslation('edit.html.field.administradores.legend')}</label>
			<input type="text" id="usuarios-administradores" name="usuarios-administradores" class="form-control" value="${usuariosAdministradores!}" />
		</div>
	</fieldset>
	
	<div class="form-group">
		<label for="emails-extras">${i18n.getTranslation('edit.html.field.emails.legend')}</label>
		<input type="text" id="emails-extras" name="emails-extras" class="form-control" value="${emailsExtras!}" />
		<p class="help-block">${i18n.getTranslation('edit.html.field.emails.help')}</p>
	</div>
	
	<div class="form-group">
		<label for="email-template">${i18n.getTranslation('edit.html.field.template.legend')}</label>
		<input type="text" id="email-template" name="email-template" class="form-control" value="${emailTemplate!'tplEmergencyButton'}" />
	</div>
	
	<button class="btn btn-primary" data-salvar>${i18n.getTranslation('edit.html.button.save')}</button>
</div>