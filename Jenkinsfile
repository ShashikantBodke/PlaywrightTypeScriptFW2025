// ============================================
// PLAYWRIGHT AUTO PIPELINE - JENKINSFILE (WINDOWS CONVERTED)
// ============================================
// Flow: lint → dev → qa → stage → prod (automatic)
// Trigger: Push, PR, or manual build
// Reports: Separate Allure per environment, Playwright HTML, Custom HTML
// ============================================

pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        NODE_VERSION = '22.14.0'
        CI = 'true'
        // Use backslashes for Windows path separator
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}\\.cache\\ms-playwright"
        SLACK_WEBHOOK_URL = credentials('slack-webhook-token')
        // Email recipients
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
                // npm ci is cross-platform, but executed via 'bat'
                bat 'npm ci'

                echo '============================================'
                echo '📁 Creating ESLint report directory...'
                echo '============================================'
                // Converted 'sh 'mkdir -p eslint-report'' to idempotent 'bat' command
                bat 'if not exist eslint-report md eslint-report'

                echo '============================================'
                echo '🔍 Running ESLint...'
                echo '============================================'
                script {
                    // Replaced 'sh' with 'bat'
                    def eslintStatus = bat(script: 'npm run lint', returnStatus: true)
                    env.ESLINT_STATUS = eslintStatus == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '📊 Generating ESLint HTML Report...'
                echo '============================================'
                // Replaced 'sh' with 'bat'. '|| true' is not strictly needed for npm run unless you want to ignore command failures
                bat 'npm run lint:report'
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
                // Replaced 'sh' with 'bat'
                bat 'npx playwright install --with-deps chromium'

                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                // Converted 'sh 'rm -rf ...'' to 'bat 'rd /s /q ...''
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results'

                echo '============================================'
                echo '🧪 Running DEV tests...'
                echo '============================================'
                script {
                    // Replaced 'sh' with 'bat'
                    env.DEV_TEST_STATUS = bat(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.dev.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                // Converted 'sh '''...''' to 'bat '''...'''
                bat '''
                    REM 1. Create the directory (mkdir -p allure-results)
                    if not exist allure-results md allure-results
                    
                    REM 2. Create and write the first line (echo "..." > file)
                    echo Environment=DEV > allure-results\\environment.properties
                    
                    REM 3. Append the remaining lines (echo "..." >> file)
                    echo Browser=Google Chrome >> allure-results\\environment.properties
                    echo Config=playwright.config.dev.ts >> allure-results\\environment.properties
                '''
            }
            post {
                always {
                    // Copy and generate DEV Allure Report
                    // Converted 'sh '''...''' to 'bat '''...'''
                    bat '''
                        REM 1. Create directory (mkdir -p allure-results-dev)
                        if not exist allure-results-dev md allure-results-dev

                        REM 2. Copy recursively (cp -r allure-results/* allure-results-dev/ 2>/dev/null || true)
                        REM xcopy /E /I /Y copies directories and suppresses prompts.
                        xcopy /E /I /Y allure-results\\* allure-results-dev\\

                        REM 3. Generate report (npx allure generate ... || true)
                        npx allure generate allure-results-dev --clean -o allure-report-dev
                        
                        REM Mimic '|| true' by forcing exit 0 after the report generation
                        exit 0
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

                    archiveArtifacts artifacts: 'allure-results-dev/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // QA Environment Tests
        // ============================================
        stage('🔍 QA Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                // Converted 'sh 'rm -rf ...'' to 'bat 'rd /s /q ...''
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results'

                echo '============================================'
                echo '🧪 Running QA tests...'
                echo '============================================'
                script {
                    // Replaced 'sh' with 'bat'
                    env.QA_TEST_STATUS = bat(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.qa.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                // Converted 'sh '''...''' to 'bat '''...'''
                bat '''
                    REM 1. Create the directory (mkdir -p allure-results)
                    if not exist allure-results md allure-results
                    
                    REM 2. Create and write the first line (echo "..." > file)
                    echo Environment=QA > allure-results\\environment.properties
                    
                    REM 3. Append the remaining lines (echo "..." >> file)
                    echo Browser=Google Chrome >> allure-results\\environment.properties
                    echo Config=playwright.config.qa.ts >> allure-results\\environment.properties
                '''
            }
            post {
                always {
                    // Copy and generate QA Allure Report
                    // Converted 'sh '''...''' to 'bat '''...'''
                    bat '''
                        REM 1. Create directory (mkdir -p allure-results-qa)
                        if not exist allure-results-qa md allure-results-qa
                        
                        REM 2. Copy recursively (cp -r allure-results/* allure-results-qa/ 2>/dev/null || true)
                        xcopy /E /I /Y allure-results\\* allure-results-qa\\

                        REM 3. Generate report (npx allure generate ... || true)
                        npx allure generate allure-results-qa --clean -o allure-report-qa
                        
                        REM Mimic '|| true' by forcing exit 0 after the report generation
                        exit 0
                    '''

                    // Publish QA Allure HTML Report
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
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // STAGE Environment Tests
        // ============================================
        stage('🎯 STAGE Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                // Converted 'sh 'rm -rf ...'' to 'bat 'rd /s /q ...''
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results'

                echo '============================================'
                echo '🧪 Running STAGE tests...'
                echo '============================================'
                script {
                    // Replaced 'sh' with 'bat'
                    env.STAGE_TEST_STATUS = bat(
                        script: 'npx playwright test --grep "@login" --config=playwright.config.stage.ts',
                        returnStatus: true
                    ) == 0 ? 'success' : 'failure'
                }

                echo '============================================'
                echo '🏷️ Adding Allure environment info...'
                echo '============================================'
                // Converted 'sh '''...''' to 'bat '''...'''
                bat '''
                    REM 1. Create the directory (mkdir -p allure-results)
                    if not exist allure-results md allure-results
                    
                    REM 2. Create and write the first line (echo "..." > file)
                    echo Environment=STAGE > allure-results\\environment.properties
                    
                    REM 3. Append the remaining lines (echo "..." >> file)
                    echo Browser=Google Chrome >> allure-results\\environment.properties
                    echo Config=playwright.config.stage.ts >> allure-results\\environment.properties
                '''
            }
            post {
                always {
                    // Copy and generate STAGE Allure Report
                    // Converted 'sh '''...''' to 'bat '''...'''
                    bat '''
                        REM 1. Create directory (mkdir -p allure-results-stage)
                        if not exist allure-results-stage md allure-results-stage
                        
                        REM 2. Copy recursively (cp -r allure-results/* allure-results-stage/ 2>/dev/null || true)
                        xcopy /E /I /Y allure-results\\* allure-results-stage\\

                        REM 3. Generate report (npx allure generate ... || true)
                        npx allure generate allure-results-stage --clean -o allure-report-stage
                        
                        REM Mimic '|| true' by forcing exit 0 after the report generation
                        exit 0
                    '''

                    // Publish STAGE Allure HTML Report
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
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                }
            }
        }

        // ============================================
        // PROD Environment Tests
        // ============================================
        stage('🚀 PROD Tests') {
            steps {
                echo '============================================'
                echo '🧹 Cleaning previous results...'
                echo '============================================'
                // Converted 'sh 'rm -rf ...'' to 'bat 'rd /s /q ...''
                bat 'rd /s /q allure-results playwright-report playwright-html-report test-results'

                echo '============================================'
                echo '🧪 Running PROD tests...'
                echo '============================================'
                script {
                    // Replaced 'sh' with 'bat'
                    env.PROD_TEST_STATUS = bat(
                        script: 'npx playwright test --grep "@login" --
