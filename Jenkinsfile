// ============================================
// PLAYWRIGHT AUTO PIPELINE - JENKINSFILE (WINDOWS CONVERTED - DEBUGGED)
// ============================================

pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        NODE_VERSION = '22.14.0'
        CI = 'true'
        // CRITICAL: Use backslashes for Windows path separator in environment variables
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}\\.cache\\ms-playwright"
        SLACK_WEBHOOK_URL = credentials('slack-webhook-token')
        EMAIL_RECIPIENTS = 'bodkeshashi12@gmail.com'
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
                bat 'npm ci'

                echo '============================================'
                echo '📁 Creating ESLint report directory...'
                echo '============================================'
                // FIX: Use conditional 'if not exist' to prevent failure if directory exists (idempotent)
                bat 'if not exist eslint-report md eslint-report'

                echo '============================================'
                echo '🔍 Running ESLint...'
                echo '============================================'
                script {
                    def eslintStatus = bat(script: 'npm run lint', returnStatus: true)
                    env.ESLINT_STATUS = eslintStatus == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '📊 Generating ESLint HTML Report...'
                echo '============================================'
                bat 'npm run lint:report'
            }
            post { /* ... post steps remain the same ... */ }
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
                // FIX: Ensure paths use backslashes and that the command is executed correctly
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results 2>nul'

                echo '============================================'
                echo '🧪 Running DEV tests...'
                echo '============================================'
                script {
                    env.DEV_TEST_STATUS = bat(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.dev.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                // FIX: Ensure quotes are not used around variables in 'echo' to prevent them being written to the file
                bat '''
                    if not exist allure-results md allure-results
                    
                    REM Use backslashes for path separators
                    echo Environment=DEV > allure-results\\environment.properties
                    echo Browser=Google Chrome >> allure-results\\environment.properties
                    echo Config=playwright.config.dev.ts >> allure-results\\environment.properties
                '''
            }
            post {
                always {
                    // FIX: Reliable copying and report generation block
                    bat '''
                        REM 1. Create directory (idempotent)
                        if not exist allure-results-dev md allure-results-dev

                        REM 2. Copy recursively (equivalent of cp -r 2>/dev/null || true)
                        REM xcopy handles recursive copy. The exit 0 at the end handles the '|| true'.
                        xcopy /E /I /Y allure-results\\* allure-results-dev\\

                        REM 3. Generate report
                        npx allure generate allure-results-dev --clean -o allure-report-dev
                        
                        REM CRITICAL: Force exit 0 to ensure the Jenkins step succeeds even if npx fails
                        exit 0
                    '''
                    // ... rest of post steps remain the same ...
                }
            }
        }

        // ============================================
        // QA, STAGE, PROD Stages
        // Apply the same `if not exist` and `rd /s /q ... 2>nul` fixes to these stages
        // ============================================
        
        stage('🔍 QA Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results 2>nul'
                
                // ... rest of steps ...
            }
            post {
                always {
                    bat '''
                        if not exist allure-results-qa md allure-results-qa
                        xcopy /E /I /Y allure-results\\* allure-results-qa\\
                        npx allure generate allure-results-qa --clean -o allure-report-qa
                        exit 0
                    '''
                    // ... rest of post steps ...
                }
            }
        }

        stage('🎯 STAGE Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results 2>nul'
                
                // ... rest of steps ...
            }
            post {
                always {
                    bat '''
                        if not exist allure-results-stage md allure-results-stage
                        xcopy /E /I /Y allure-results\\* allure-results-stage\\
                        npx allure generate allure-results-stage --clean -o allure-report-stage
                        exit 0
                    '''
                    // ... rest of post steps ...
                }
            }
        }

        stage('🚀 PROD Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results 2>nul'
                
                // ... rest of steps ...
            }
            post {
                always {
                    bat '''
                        if not exist allure-results-prod md allure-results-prod
                        xcopy /E /I /Y allure-results\\* allure-results-prod\\
                        npx allure generate allure-results-prod --clean -o allure-report-prod
                        exit 0
                    '''
                    // ... rest of post steps ...
                }
            }
        }

        // ============================================
        // Combined Allure Report
        // ============================================
        stage('📈 Combined Allure Report') {
            steps {
                echo '============================================'
                echo '📊 Generating Combined Allure Report...'
                echo '============================================'

                bat '''
                    REM Create combined results directory (idempotent)
                    if not exist allure-results-combined md allure-results-combined
                    
                    REM Copy all environment results (xcopy is used for recursive copy)
                    xcopy /E /I /Y allure-results-dev\\* allure-results-combined\\
                    xcopy /E /I /Y allure-results-qa\\* allure-results-combined\\
                    xcopy /E /I /Y allure-results-stage\\* allure-results-combined\\
                    xcopy /E /I /Y allure-results-prod\\* allure-results-combined\\

                    REM Create combined environment.properties
                    echo Environment=ALL (DEV, QA, STAGE, PROD) > allure-results-combined\\environment.properties
                    echo Browser=Google Chrome >> allure-results-combined\\environment.properties
                    echo Pipeline=%JOB_NAME% >> allure-results-combined\\environment.properties
                    echo Build=%BUILD_NUMBER% >> allure-results-combined\\environment.properties
                    
                    REM The xcopy commands may fail if the source directory is empty, which is acceptable.
                    exit 0
                '''
            }
            post {
                always {
                    // Generate Combined Allure Report using Allure Jenkins Plugin
                    allure([
                        includeProperties: true,
                        jdk: '',
                        properties: [],
                        reportBuildPolicy: 'ALWAYS',
                        results: [[path: 'allure-results-combined']]
                    ])
                }
            }
        }
    }

    // ============================================
    // Post-Build Actions (Notifications)
    // ============================================
    post {
        always {
            echo '============================================'
            echo '📬 PIPELINE SUMMARY'
            echo '============================================'

            script {
                def devStatus = env.DEV_TEST_STATUS ?: 'unknown'
                def qaStatus = env.QA_TEST_STATUS ?: 'unknown'
                def stageStatus = env.STAGE_TEST_STATUS ?: 'unknown'
                def prodStatus = env.PROD_TEST_STATUS ?: 'unknown'

                def devEmoji = devStatus == 'success' ? '✅' : '❌'
                def qaEmoji = qaStatus == 'success' ? '✅' : '❌'
                def stageEmoji = stageStatus == 'success' ? '✅' : '❌'
                def prodEmoji = prodStatus == 'success' ? '✅' : '❌'

                echo """
============================================
📊 Test Results by Environment:
============================================
${devEmoji} DEV:   ${devStatus}
${qaEmoji} QA:    ${qaStatus}
${stageEmoji} STAGE: ${stageStatus}
${prodEmoji} PROD:  ${prodStatus}
============================================
"""

                def overallStatus = 'SUCCESS'
                def statusEmoji = '✅'
                def statusColor = 'good'

                if (devStatus == 'failure' || qaStatus == 'failure' || stageStatus == 'failure' || prodStatus == 'failure') {
                    overallStatus = 'FAILURE'
                    statusEmoji = '❌'
                    statusColor = 'danger'
                } else if (devStatus == 'unknown' || qaStatus == 'unknown' || stageStatus == 'unknown' || prodStatus == 'unknown') {
                    overallStatus = 'UNSTABLE'
                    statusEmoji = '⚠️'
                    statusColor = 'warning'
                }

                env.OVERALL_STATUS = overallStatus
                env.STATUS_EMOJI = statusEmoji
                env.STATUS_COLOR = statusColor
                env.DEV_EMOJI = devEmoji
                env.QA_EMOJI = qaEmoji
                env.STAGE_EMOJI = stageEmoji
                env.PROD_EMOJI = prodEmoji
            }
        }

        success {
            echo '✅ Pipeline completed successfully!'

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

📊 <${env.BUILD_URL}allure|Combined Allure Report>
🔗 <${env.BUILD_URL}|View Build>"""
                    )
                } catch (Exception e) {
                    echo "Slack notification failed: ${e.message}"
                }

                // Email notification
                try {
                    emailext(
                        subject: "✅ Playwright Tests Passed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
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
            <h1>✅ Playwright Pipeline Results</h1>
            <h2>All Tests Passed</h2>
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
                    <td class="success">${env.DEV_TEST_STATUS}</td>
                    <td><a href="${env.BUILD_URL}DEV_20Allure_20Report" class="btn btn-green">Allure</a></td>
                    <td><a href="${env.BUILD_URL}DEV_20Playwright_20Report" class="btn">Playwright</a></td>
                    <td><a href="${env.BUILD_URL}DEV_20HTML_20Report" class="btn btn-orange">HTML</a></td>
                </tr>
                <tr>
                    <td>🔍 QA</td>
                    <td class="success">${env.QA_TEST_STATUS}</td>
                    <td><a href="${env.BUILD_URL}QA_20Allure_20Report" class="btn btn-green">Allure</a></td>
                    <td><a href="${env.BUILD_URL}QA_20Playwright_20Report" class="btn">Playwright</a></td>
                    <td><a href="${env.BUILD_URL}QA_20HTML_20Report" class="btn btn-orange">HTML</a></td>
                </tr>
                <tr>
                    <td>🎯 STAGE</td>
                    <td class="success">${env.STAGE_TEST_STATUS}</td>
                    <td><a href="${env.BUILD_URL}STAGE_20Allure_20Report" class="btn btn-green">Allure</a></td>
                    <td><a href="${env.BUILD_URL}STAGE_20Playwright_20Report" class="btn">Playwright</a></td>
                    <td><a href="${env.BUILD_URL}STAGE_20HTML_20Report" class="btn btn-orange">HTML</a></td>
                </tr>
                <tr>
                    <td>🚀 PROD</td>
                    <td class="success">${env.PROD_TEST_STATUS}</td>
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

            <div class="section-title">📁 All Reports</div>
            <table class="status-table">
                <tr><th>Report Type</th><th>DEV</th><th>QA</th><th>STAGE</th><th>PROD</th></tr>
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
        .btn-red { background: #e74c3c; }
        .section-title { background: #34495e; color: white; padding: 10px; margin-top: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Playwright Pipeline Results</h1>
            <h2>Tests Failed</h2>
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
                    <td class="${env.DEV_TEST_STATUS == 'success' ? 'success' : 'failure'}">${env.DEV_TEST_STATUS ?: 'not run'}</td>
                    <td><a href="${env.BUILD_URL}DEV_20Allure_20Report" class="btn btn-green">Allure</a></td>
                    <td><a href="${env.BUILD_URL}DEV_20Playwright_20Report" class="btn">Playwright</a></td>
                    <td><a href="${env.BUILD_URL}DEV_20HTML_20Report" class="btn btn-orange">HTML</a></td>
                </tr>
                <tr>
                    <td>🔍 QA</td>
                    <td class="${env.QA_TEST_STATUS == 'success' ? 'success' : 'failure'}">${env.QA_TEST_STATUS ?: 'not run'}</td>
                    <td><a href="${env.BUILD_URL}QA_20Allure_20Report" class="btn btn-green">Allure</a></td>
                    <td><a href="${env.BUILD_URL}QA_20Playwright_20Report" class="btn">Playwright</a></td>
                    <td><a href="${env.BUILD_URL}QA_20HTML_20Report" class="btn btn-orange">HTML</a></td>
                </tr>
                <tr>
                    <td>🎯 STAGE</td>
                    <td class="${env.STAGE_TEST_STATUS == 'success' ? 'success' : 'failure'}">${env.STAGE_TEST_STATUS ?: 'not run'}</td>
                    <td><a href="${env.BUILD_URL}STAGE_20Allure_20Report" class="btn btn-green">Allure</a></td>
                    <td><a href="${env.BUILD_URL}STAGE_20Playwright_20Report" class="btn">Playwright</a></td>
                    <td><a href="${env.BUILD_URL}STAGE_20HTML_20Report" class="btn btn-orange">HTML</a></td>
                </tr>
                <tr>
                    <td>🚀 PROD</td>
                    <td class="${env.PROD_TEST_STATUS == 'success' ? 'success' : 'failure'}">${env.PROD_TEST_STATUS ?: 'not run'}</td>
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
                <a href="${env.BUILD_URL}console" class="btn btn-red">📋 Console Log</a>
            </p>

            <div class="section-title">📁 All Reports</div>
            <table class="status-table">
                <tr><th>Report Type</th><th>DEV</th><th>QA</th><th>STAGE</th><th>PROD</th></tr>
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

        unstable {
            echo '⚠️ Pipeline completed with warnings!'

            script {
                try {
                    slackSend(
                        color: 'warning',
                        message: """⚠️ *Playwright Pipeline: Unstable*

*Repository:* ${env.JOB_NAME}
*Branch:* ${env.GIT_BRANCH ?: 'N/A'}
*Build:* #${env.BUILD_NUMBER}

📊 <${env.BUILD_URL}allure|View Allure Report>
🔗 <${env.BUILD_URL}|View Build>"""
                    )
                } catch (Exception e) {
                    echo "Slack notification failed: ${e.message}"
                }
            }
        }
    }
}
