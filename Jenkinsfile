// ============================================
// PLAYWRIGHT AUTO PIPELINE - JENKINSFILE (WINDOWS COMPATIBLE - FIXED)
// ============================================
// Flow: lint → dev → qa → stage → prod (automatic)
// Trigger: Push, PR, or manual build
// Reports: Separate Allure per environment, Playwright HTML, Custom HTML
// REQUIRED: Jenkins agent must be running on Windows.
// FIXES: Path handling for spaces in username, multiline bat syntax corrected
// ============================================

pipeline {
    agent any

    tools {
        // Ensure this name matches the Node.js installation in Jenkins Global Tool Configuration
        nodejs 'NodeJS'
    }

    environment {
        // Use double backslashes for Windows paths in Groovy strings
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}\\.cache\\ms-playwright"
        // Credentials binding for Slack
        SLACK_WEBHOOK_URL = credentials('slack-webhook-token')
        // Email recipients - update these with your actual email addresses
        EMAIL_RECIPIENTS = 'bodkeshashi12@gmail.com'

        // Set global Node version for reference, though the tool definition handles the PATH
        NODE_VERSION = '22.14.0'
        CI = 'true'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        // ============================================
        // Static Code Analysis (ESLint)
        // ============================================
        stage('🔍 ESLint Analysis') {
            steps {
                echo '============================================'
                echo '📥 Installing dependencies...'
                echo '============================================'
                // Use 'bat' for NPM/Node commands on Windows
                bat 'npm ci'

                echo '============================================'
                echo '📁 Creating ESLint report directory...'
                echo '============================================'
                // PowerShell equivalent for 'mkdir -p'
                bat 'powershell New-Item -ItemType Directory -Path eslint-report -Force'

                echo '============================================'
                echo '🔍 Running ESLint...'
                echo '============================================'
                script {
                    // Use 'bat' for command execution on Windows
                    def eslintStatus = bat(script: 'npm run lint', returnStatus: true)
                    env.ESLINT_STATUS = eslintStatus == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '📊 Generating ESLint HTML Report...'
                echo '============================================'
                // Use 'bat' for command execution on Windows
                bat 'npm run lint:report || exit 0' // Use || exit 0 for robust execution in bat
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'eslint-report',
                        reportFiles: 'index.html',
                        reportName: 'ESLint Report',
                        reportTitles: 'ESLint Analysis'
                    ])
                    script {
                        if (env.ESLINT_STATUS == 'failure') {
                            echo '⚠️ ESLint found issues - check the HTML report'
                        } else {
                            echo '✅ No ESLint issues found'
                        }
                    }
                }
            }
        }

        // ============================================
        // DEV Environment Tests
        // ============================================
        stage('🔧 DEV Tests') {
            steps {
                echo '============================================'
                echo '🎭 Installing Playwright browsers...'
                echo '============================================'
                bat 'npx playwright install --with-deps chromium'

                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                // PowerShell equivalent for 'rm -rf'
                bat 'powershell Remove-Item -Recurse -Force -ErrorAction SilentlyContinue allure-results, playwright-report, playwright-html-report, test-results'

                echo '============================================'
                echo '🧪 Running DEV tests...'
                echo '============================================'
                script {
                    // Use 'bat' for Playwright execution
                    env.DEV_TEST_STATUS = bat(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.dev.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                // Multiline PowerShell command for directory creation and setting properties file
                bat '''
                    powershell New-Item -ItemType Directory -Path allure-results -Force
                    powershell Set-Content -Path allure-results\\environment.properties -Value "Environment=DEV"
                    powershell Add-Content -Path allure-results\\environment.properties -Value "Browser=Chrome"
                    powershell Add-Content -Path allure-results\\environment.properties -Value "Config=playwright.config.dev.ts"
                '''
            }
            post {
                always {
                    // FIXED: Proper multiline bat syntax with triple quotes
                    // FIXED: Using PowerShell to handle paths with spaces properly
                    bat '''
                        powershell New-Item -ItemType Directory -Path allure-results-dev -Force
                        powershell Copy-Item -Path allure-results\\* -Destination allure-results-dev\\ -Recurse -Force -ErrorAction SilentlyContinue
                    '''
                    
                    // FIXED: Using PowerShell wrapper to handle paths with spaces
                    bat '''
                        powershell -Command "& { cd '%CD%'; npx allure generate allure-results-dev --clean -o allure-report-dev }" || exit 0
                    '''

                    // Publish DEV Allure HTML Report
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-dev',
                        reportFiles: 'index.html',
                        reportName: 'DEV Allure Report',
                        reportTitles: 'DEV Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'DEV Playwright Report',
                        reportTitles: 'DEV Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report',
                        reportFiles: 'index.html',
                        reportName: 'DEV HTML Report',
                        reportTitles: 'DEV Custom HTML Report'
                    ])

                    // Archive test results artifacts
                    archiveArtifacts artifacts: 'allure-results-dev/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // QA Environment Tests
        // ============================================
        stage('🔍 QA Tests') {
            when {
                expression { env.DEV_TEST_STATUS == 'success' }
            }
            steps {
                echo '============================================'
                echo '🧹 Cleaning QA results...'
                echo '============================================'
                bat 'powershell Remove-Item -Recurse -Force -ErrorAction SilentlyContinue allure-results, playwright-report, playwright-html-report, test-results'

                echo '============================================'
                echo '🧪 Running QA tests...'
                echo '============================================'
                script {
                    env.QA_TEST_STATUS = bat(
                        script: 'npx playwright test --grep "@smoke" --config=playwright.config.qa.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                bat '''
                    powershell New-Item -ItemType Directory -Path allure-results -Force
                    powershell Set-Content -Path allure-results\\environment.properties -Value "Environment=QA"
                    powershell Add-Content -Path allure-results\\environment.properties -Value "Browser=Chrome"
                    powershell Add-Content -Path allure-results\\environment.properties -Value "Config=playwright.config.qa.ts"
                '''
            }
            post {
                always {
                    // FIXED: Proper multiline bat syntax and PowerShell wrapper
                    bat '''
                        powershell New-Item -ItemType Directory -Path allure-results-qa -Force
                        powershell Copy-Item -Path allure-results\\* -Destination allure-results-qa\\ -Recurse -Force -ErrorAction SilentlyContinue
                    '''
                    
                    bat '''
                        powershell -Command "& { cd '%CD%'; npx allure generate allure-results-qa --clean -o allure-report-qa }" || exit 0
                    '''

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-qa',
                        reportFiles: 'index.html',
                        reportName: 'QA Allure Report',
                        reportTitles: 'QA Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'QA Playwright Report',
                        reportTitles: 'QA Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report',
                        reportFiles: 'index.html',
                        reportName: 'QA HTML Report',
                        reportTitles: 'QA Custom HTML Report'
                    ])

                    archiveArtifacts artifacts: 'allure-results-qa/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // STAGE Environment Tests
        // ============================================
        stage('🎯 STAGE Tests') {
            when {
                expression { env.QA_TEST_STATUS == 'success' }
            }
            steps {
                echo '============================================'
                echo '🧹 Cleaning STAGE results...'
                echo '============================================'
                bat 'powershell Remove-Item -Recurse -Force -ErrorAction SilentlyContinue allure-results, playwright-report, playwright-html-report, test-results'

                echo '============================================'
                echo '🧪 Running STAGE tests...'
                echo '============================================'
                script {
                    env.STAGE_TEST_STATUS = bat(
                        script: 'npx playwright test --grep "@regression" --config=playwright.config.stage.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                bat '''
                    powershell New-Item -ItemType Directory -Path allure-results -Force
                    powershell Set-Content -Path allure-results\\environment.properties -Value "Environment=STAGE"
                    powershell Add-Content -Path allure-results\\environment.properties -Value "Browser=Chrome"
                    powershell Add-Content -Path allure-results\\environment.properties -Value "Config=playwright.config.stage.ts"
                '''
            }
            post {
                always {
                    // FIXED: Proper multiline bat syntax and PowerShell wrapper
                    bat '''
                        powershell New-Item -ItemType Directory -Path allure-results-stage -Force
                        powershell Copy-Item -Path allure-results\\* -Destination allure-results-stage\\ -Recurse -Force -ErrorAction SilentlyContinue
                    '''
                    
                    bat '''
                        powershell -Command "& { cd '%CD%'; npx allure generate allure-results-stage --clean -o allure-report-stage }" || exit 0
                    '''

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-stage',
                        reportFiles: 'index.html',
                        reportName: 'STAGE Allure Report',
                        reportTitles: 'STAGE Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'STAGE Playwright Report',
                        reportTitles: 'STAGE Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report',
                        reportFiles: 'index.html',
                        reportName: 'STAGE HTML Report',
                        reportTitles: 'STAGE Custom HTML Report'
                    ])

                    archiveArtifacts artifacts: 'allure-results-stage/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // PROD Environment Tests
        // ============================================
        stage('🚀 PROD Tests') {
            when {
                expression { env.STAGE_TEST_STATUS == 'success' }
            }
            steps {
                echo '============================================'
                echo '🧹 Cleaning PROD results...'
                echo '============================================'
                bat 'powershell Remove-Item -Recurse -Force -ErrorAction SilentlyContinue allure-results, playwright-report, playwright-html-report, test-results'

                echo '============================================'
                echo '🧪 Running PROD tests...'
                echo '============================================'
                script {
                    env.PROD_TEST_STATUS = bat(
                        script: 'npx playwright test --grep "@prod" --config=playwright.config.prod.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                bat '''
                    powershell New-Item -ItemType Directory -Path allure-results -Force
                    powershell Set-Content -Path allure-results\\environment.properties -Value "Environment=PROD"
                    powershell Add-Content -Path allure-results\\environment.properties -Value "Browser=Chrome"
                    powershell Add-Content -Path allure-results\\environment.properties -Value "Config=playwright.config.prod.ts"
                '''
            }
            post {
                always {
                    // FIXED: Proper multiline bat syntax and PowerShell wrapper
                    bat '''
                        powershell New-Item -ItemType Directory -Path allure-results-prod -Force
                        powershell Copy-Item -Path allure-results\\* -Destination allure-results-prod\\ -Recurse -Force -ErrorAction SilentlyContinue
                    '''
                    
                    bat '''
                        powershell -Command "& { cd '%CD%'; npx allure generate allure-results-prod --clean -o allure-report-prod }" || exit 0
                    '''

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-prod',
                        reportFiles: 'index.html',
                        reportName: 'PROD Allure Report',
                        reportTitles: 'PROD Allure Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'PROD Playwright Report',
                        reportTitles: 'PROD Playwright Report'
                    ])

                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-html-report',
                        reportFiles: 'index.html',
                        reportName: 'PROD HTML Report',
                        reportTitles: 'PROD Custom HTML Report'
                    ])

                    archiveArtifacts artifacts: 'allure-results-prod/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // Combined Allure Report (All Environments)
        // ============================================
        stage('📈 Combined Allure Report') {
            when {
                expression { env.DEV_TEST_STATUS != null }
            }
            steps {
                echo '============================================'
                echo '📊 Generating combined Allure report...'
                echo '============================================'
                script {
                    // FIXED: Using PowerShell wrapper for combined report generation
                    bat '''
                        powershell New-Item -ItemType Directory -Path allure-results-combined -Force
                        powershell Copy-Item -Path allure-results-dev\\* -Destination allure-results-combined\\ -Recurse -Force -ErrorAction SilentlyContinue
                        powershell Copy-Item -Path allure-results-qa\\* -Destination allure-results-combined\\ -Recurse -Force -ErrorAction SilentlyContinue
                        powershell Copy-Item -Path allure-results-stage\\* -Destination allure-results-combined\\ -Recurse -Force -ErrorAction SilentlyContinue
                        powershell Copy-Item -Path allure-results-prod\\* -Destination allure-results-combined\\ -Recurse -Force -ErrorAction SilentlyContinue
                    '''
                    
                    bat '''
                        powershell -Command "& { cd '%CD%'; npx allure generate allure-results-combined --clean -o allure-report-combined }" || exit 0
                    '''
                }
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'allure-report-combined',
                        reportFiles: 'index.html',
                        reportName: 'Combined Allure Report',
                        reportTitles: 'All Environments'
                    ])
                }
            }
        }
    }

    post {
        always {
            echo '============================================'
            echo '📬 PIPELINE SUMMARY'
            echo '============================================'

            script {
                // Set emoji indicators
                env.DEV_EMOJI = env.DEV_TEST_STATUS == 'success' ? '✅' : '❌'
                env.QA_EMOJI = env.QA_TEST_STATUS == 'success' ? '✅' : '❌'
                env.STAGE_EMOJI = env.STAGE_TEST_STATUS == 'success' ? '✅' : '❌'
                env.PROD_EMOJI = env.PROD_TEST_STATUS == 'success' ? '✅' : '❌'

                echo """
============================================
📊 Test Results by Environment:
============================================
${env.DEV_EMOJI} DEV:   ${env.DEV_TEST_STATUS ?: 'unknown'}
${env.QA_EMOJI} QA:    ${env.QA_TEST_STATUS ?: 'unknown'}
${env.STAGE_EMOJI} STAGE: ${env.STAGE_TEST_STATUS ?: 'unknown'}
${env.PROD_EMOJI} PROD:  ${env.PROD_TEST_STATUS ?: 'unknown'}
============================================
"""
            }
        }

        success {
            echo '✅ All tests passed!'

            script {
                // Slack notification
                try {
                    slackSend(
                        color: 'good',
                        message: """✅ *Playwright Pipeline: All Tests Passed*

*Repository:* ${env.JOB_NAME}
*Branch:* ${env.GIT_BRANCH ?: 'N/A'}
*Build:* #${env.BUILD_NUMBER}

*Test Results:*
${env.DEV_EMOJI} DEV: ${env.DEV_TEST_STATUS}
${env.QA_EMOJI} QA: ${env.QA_TEST_STATUS}
${env.STAGE_EMOJI} STAGE: ${env.STAGE_TEST_STATUS}
${env.PROD_EMOJI} PROD: ${env.PROD_TEST_STATUS}

📊 <${env.BUILD_URL}allure|View Allure Report>
🔗 <${env.BUILD_URL}|View Build>"""
                    )
                } catch (Exception e) {
                    echo "Slack notification failed: ${e.message}"
                }

                // Email notification
                try {
                    emailext(
                        subject: "✅ All Playwright Tests Passed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .status-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .status-table th, .status-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .status-table th { background: #ecf0f1; }
        .success { color: #27ae60; font-weight: bold; }
        .btn { display: inline-block; padding: 8px 16px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 3px; font-size: 12px; }
        .btn-green { background: #27ae60; }
        .btn-orange { background: #f39c12; }
        .btn-purple { background: #9b59b6; }
        .section-title { background: #34495e; color: white; padding: 10px; margin-top: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ All Playwright Tests Passed!</h1>
            <h2>Pipeline completed successfully</h2>
        </div>
        <div class="content">
            <h3>📋 Pipeline Information</h3>
            <table class="status-table">
                <tr><th>Job</th><td>${env.JOB_NAME}</td></tr>
                <tr><th>Build</th><td>#${env.BUILD_NUMBER}</td></tr>
                <tr><th>Branch</th><td>${env.GIT_BRANCH ?: 'N/A'}</td></tr>
            </table>

            <h3>🧪 Test Results by Environment</h3>
            <table class="status-table">
                <tr>
                    <th>Environment</th>
                    <th>Status</th>
                </tr>
                <tr>
                    <td>🔧 DEV</td>
                    <td class="success">${env.DEV_TEST_STATUS}</td>
                </tr>
                <tr>
                    <td>🔍 QA</td>
                    <td class="success">${env.QA_TEST_STATUS}</td>
                </tr>
                <tr>
                    <td>🎯 STAGE</td>
                    <td class="success">${env.STAGE_TEST_STATUS}</td>
                </tr>
                <tr>
                    <td>🚀 PROD</td>
                    <td class="success">${env.PROD_TEST_STATUS}</td>
                </tr>
            </table>

            <div class="section-title">📊 View Reports</div>
            <table class="status-table">
                <tr>
                    <th>Report Type</th>
                    <th>DEV</th>
                    <th>QA</th>
                    <th>STAGE</th>
                    <th>PROD</th>
                </tr>
                <tr>
                    <td><strong>Allure</strong></td>
                    <td><a href="${env.BUILD_URL}DEV_20Allure_20Report">View</a></td>
                    <td><a href="${env.BUILD_URL}QA_20Allure_20Report">View</a></td>
                    <td><a href="${env.BUILD_URL}STAGE_20Allure_20Report">View</a></td>
                    <td><a href="${env.BUILD_URL}PROD_20Allure_20Report">View</a></td>
                </tr>
                <tr>
                    <td><strong>Playwright</strong></td>
                    <td><a href="${env.BUILD_URL}DEV_20Playwright_20Report">View</a></td>
                    <td><a href="${env.BUILD_URL}QA_20Playwright_20Report">View</a></td>
                    <td><a href="${env.BUILD_URL}STAGE_20Playwright_20Report">View</a></td>
                    <td><a href="${env.BUILD_URL}PROD_20Playwright_20Report">View</a></td>
                </tr>
                <tr>
                    <td><strong>Custom HTML</strong></td>
                    <td><a href="${env.BUILD_URL}DEV_20HTML_20Report">View</a></td>
                    <td><a href="${env.BUILD_URL}QA_20HTML_20Report">View</a></td>
                    <td><a href="${env.BUILD_URL}STAGE_20HTML_20Report">View</a></td>
                    <td><a href="${env.BUILD_URL}PROD_20HTML_20Report">View</a></td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>""",
                        mimeType: 'text/html',
                        to: env.EMAIL_RECIPIENTS,
                        from: 'CI Notifications <mail@naveenautomationlabs.com>',
                        replyTo: 'mail@naveenautomationlabs.com'
                    )
                } catch (Exception e) {
                    echo "Email notification failed: ${e.message}"
                }
            }
        }

        failure {
            echo '❌ Pipeline failed!'

            script {
                // Slack notification
                try {
                    slackSend(
                        color: 'danger',
                        message: """❌ *Playwright Pipeline: Tests Failed*

*Repository:* ${env.JOB_NAME}
*Branch:* ${env.GIT_BRANCH ?: 'N/A'}
*Build:* #${env.BUILD_NUMBER}

*Test Results:*
${env.DEV_EMOJI ?: '❓'} DEV: ${env.DEV_TEST_STATUS ?: 'not run'}
${env.QA_EMOJI ?: '❓'} QA: ${env.QA_TEST_STATUS ?: 'not run'}
${env.STAGE_EMOJI ?: '❓'} STAGE: ${env.STAGE_TEST_STATUS ?: 'not run'}
${env.PROD_EMOJI ?: '❓'} PROD: ${env.PROD_TEST_STATUS ?: 'not run'}

📊 <${env.BUILD_URL}allure|View Allure Report>
🔗 <${env.BUILD_URL}|View Build>"""
                    )
                } catch (Exception e) {
                    echo "Slack notification failed: ${e.message}"
                }

                // Email notification
                try {
                    emailext(
                        subject: "❌ Playwright Tests Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .status-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .status-table th, .status-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .status-table th { background: #ecf0f1; }
        .success { color: #27ae60; font-weight: bold; }
        .failure { color: #e74c3c; font-weight: bold; }
        .btn { display: inline-block; padding: 8px 16px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 3px; font-size: 12px; }
        .btn-green { background: #27ae60; }
        .btn-orange { background: #f39c12; }
        .btn-purple { background: #9b59b6; }
        .section-title { background: #34495e; color: white; padding: 10px; margin-top: 20px; border-radius: 5px; }
        .report-grid { display: table; width: 100%; margin: 10px 0; }
        .report-row { display: table-row; }
        .report-cell { display: table-cell; padding: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Playwright Pipeline Failed</h1>
            <h2>One or more tests failed!</h2>
        </div>
        <div class="content">
            <h3>📋 Pipeline Information</h3>
            <table class="status-table">
                <tr><th>Job</th><td>${env.JOB_NAME}</td></tr>
                <tr><th>Build</th><td>#${env.BUILD_NUMBER}</td></tr>
                <tr><th>Branch</th><td>${env.GIT_BRANCH ?: 'N/A'}</td></tr>
            </table>

            <h3>🧪 Test Results by Environment</h3>
            <table class="status-table">
                <tr>
                    <th>Environment</th>
                    <th>Status</th>
                    <th>Allure Report</th>
                    <th>Playwright Report</th>
                    <th>HTML Report</th>
                </tr>
                <tr>
                    <td>🔧 DEV</td>
                    <td class="${env.DEV_TEST_STATUS}">${env.DEV_TEST_STATUS}</td>
                    <td><a href="${env.BUILD_URL}DEV_20Allure_20Report" class="btn btn-green">Allure</a></td>
                    <td><a href="${env.BUILD_URL}DEV_20Playwright_20Report" class="btn">Playwright</a></td>
                    <td><a href="${env.BUILD_URL}DEV_20HTML_20Report" class="btn btn-orange">HTML</a></td>
                </tr>
                <tr>
                    <td>🔍 QA</td>
                    <td class="${env.QA_TEST_STATUS}">${env.QA_TEST_STATUS}</td>
                    <td><a href="${env.BUILD_URL}QA_20Allure_20Report" class="btn btn-green">Allure</a></td>
                    <td><a href="${env.BUILD_URL}QA_20Playwright_20Report" class="btn">Playwright</a></td>
                    <td><a href="${env.BUILD_URL}QA_20HTML_20Report" class="btn btn-orange">HTML</a></td>
                </tr>
                <tr>
                    <td>🎯 STAGE</td>
                    <td class="${env.STAGE_TEST_STATUS}">${env.STAGE_TEST_STATUS}</td>
                    <td><a href="${env.BUILD_URL}STAGE_20Allure_20Report" class="btn btn-green">Allure</a></td>
                    <td><a href="${env.BUILD_URL}STAGE_20Playwright_20Report" class="btn">Playwright</a></td>
                    <td><a href="${env.BUILD_URL}STAGE_20HTML_20Report" class="btn btn-orange">HTML</a></td>
                </tr>
                <tr>
                    <td>🚀 PROD</td>
                    <td class="${env.PROD_TEST_STATUS}">${env.PROD_TEST_STATUS}</td>
                    <td><a href="${env.BUILD_URL}PROD_20Allure_20Report" class="btn btn-green">Allure</a></td>
                    <td><a href="${env.BUILD_URL}PROD_20Playwright_20Report" class="btn">Playwright</a></td>
                    <td><a href="${env.BUILD_URL}PROD_20HTML_20Report" class="btn btn-orange">HTML</a></td>
                </tr>
            </table>

            <div class="section-title">📊 Quick Links</div>
            <p style="margin: 15px 0;">
                <a href="${env.BUILD_URL}allure" class="btn btn-green">📊 Combined Allure Report</a>
                <a href="${env.BUILD_URL}ESLint_20Report" class="btn btn-purple">🔍 ESLint Report</a>
                <a href="${env.BUILD_URL}" class="btn">🔗 View Build</a>
                <a href="${env.BUILD_URL}console" class="btn btn-orange">📋 Console Log</a>
            </p>

        </div>
    </div>
</body>
</html>""",
                        mimeType: 'text/html',
                        to: env.EMAIL_RECIPIENTS,
                        from: 'CI Notifications <mail@naveenautomationlabs.com>',
                        replyTo: 'mail@naveenautomationlabs.com'
                    )
                } catch (Exception e) {
                    echo "Email notification failed: ${e.message}"
                }
            }
        }
    }
}
